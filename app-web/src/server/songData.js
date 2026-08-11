const express = require('express');
const request = require('request');

const router = express.Router();

router.use("/get/songInfo", (req, res) => {
    const access_token = req.cookies.access_token;

    console.log("Peticion /get/songInfo")

    if (!req.query.id) {
        console.error("Petición inválida: faltan parámetros");
        return res.status(400).send("Faltan parámetros");
    }

    const options = {
        url: `
            https://api.spotify.com/v1/tracks/${req.query.id}`,
        headers: { 'Authorization': 'Bearer '+ access_token} 
    }
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.status(200).json({ track: body });
        } else {
            console.log("ERROR Song data"+ error);
            res.status(404).send("Error fetching top tracks");
        }
    });
})

router.use("/get/songInfoName", (req, res) => {
    const access_token = req.cookies.access_token;
    const songName = req.query.songName;

    console.log("Petición /get/songInfoName");

    if (!songName) {
        console.error("Petición inválida: falta 'songName'");
        return res.status(400).send("Falta parámetro 'songName'");
    }

    const options = {
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200 && body.tracks.items.length > 0) {
            res.status(200).json({ track: body.tracks.items[0] });
        } else {
            console.error("Error al buscar canción por nombre:", error || body);
            res.status(404).send("No se encontró la canción");
        }
    });
});

router.get('/test-ollama', (req, res) => {
  const options = {
    url: 'http://localhost:11434/api/generate',
    method: 'POST',
    json: {
      model: 'llama2-uncensored',    // Cambia por tu modelo
      prompt: 'Hola, ¿cómo estás?',
      max_tokens: 50
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ error: body });
    }
    res.json(body);
  });
});

module.exports = router;