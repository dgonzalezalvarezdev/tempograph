const express = require('express');
const request = require('request');

const router = express.Router();

router.use("/get/artists/topTracks", (req, res) => {
    const access_token = req.cookies.access_token;

    if (!req.query.id || !req.query.name) {
        console.error("Petición inválida: faltan parámetros");
        return res.status(400).send("Faltan parámetros");
    }

    const options = {
        url: `https://api.spotify.com/v1/artists/${req.query.id}/top-tracks`,
        headers: { 'Authorization': 'Bearer '+ access_token} 
    }
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.status(200).json({ topTracks: body });
        } else {
            console.log("ERROR Artist Data", response);
            res.status(404).send("Error fetching top tracks");
        }
    });
});

router.use("/get/artistInfo", (req, res) => {
  const access_token = req.cookies.access_token;
  const artistName = req.query.artistName;

  if (!artistName) {
    console.error("Petición inválida: falta el nombre del artista");
    return res.status(400).send("Faltan parámetros");
  }

  const options = {
    url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=10`,
    headers: { 'Authorization': 'Bearer ' + access_token }
  };

  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const data = JSON.parse(body);
      const artists = data.artists.items;

      // Normalizamos y buscamos coincidencia por nombre
      const matchedArtist = artists.find(artist =>
        artist.name.toLowerCase() === artistName.toLowerCase()
      );

      if (matchedArtist) {
        res.status(200).json({
          id: matchedArtist.id,
          name: matchedArtist.name,
          popularity: matchedArtist.popularity,
          followers: matchedArtist.followers.total,
          images: matchedArtist.images,
          genres: matchedArtist.genres
        });
      } else {
        res.status(404).send("No se encontró una coincidencia exacta para el artista");
      }
    } else {
      console.error("Error al obtener datos del artista", error || body);
      res.status(500).send("Error al obtener datos del artista");
    }
  });
});

router.get('/search/artists', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro de búsqueda (q)' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM artistas WHERE nombre LIKE ? LIMIT 20`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al buscar artistas:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
