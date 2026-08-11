import 'bootstrap/dist/css/bootstrap.css';
import './styles/App.css';
import spotify from './assets/spotify.png';
import alert from './assets/alert-circle.png';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Songs from './pages/Songs';
import Artists from './pages/Artists';
import Recommender from './pages/Recommender';
import Admin from './pages/Admin';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement
);


const server_url = process.env.REACT_APP_SERVER_URL;

export default function App() {
  const [yearSongs, setYearSongs] = useState(null);
  const [monthSongs, setMonthSongs] = useState(null);
  const [weekSongs, setWeekSongs] = useState(null);
  const [yearArtistsSongs, setYearArtistsSongs] = useState(null);
  const [monthArtistsSongs, setMonthArtistsSongs] = useState(null);
  const [weekArtistsSongs, setWeekArtistsSongs] = useState(null);
  const [yearArtists, setYearArtists] = useState(null);
  const [monthArtists, setMonthArtists] = useState(null);
  const [weekArtists, setWeekArtists] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(true);
  const [recommendedSong, setRecommendedSong] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = () => {
    axios.get(server_url + '/login')
      .then((response) => {
        const spotifyURL = response.data;
        window.location.href = spotifyURL;
      });
  };

  useEffect(() => {
    axios.get(server_url + '/auth/verify', { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(response.data.authenticated);
      })
      .catch((error) => {
        console.error("Error de autenticación:", error);
        setUserData(null);
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get(server_url + '/get/user', { withCredentials: true })
        .then((response) => {
          setUserData(response.data.userData);
          axios.post(server_url + "/api/save-user", response.data.userData)
          axios.get(server_url + `/api/get/admin?id=${response.data.userData.id}`).then((res) => {
            setIsAdmin(res.data[0].isAdmin);
          });
          getUserData();
        })
        .catch((error) => {
          console.log("Error al recibir la información del usuario:", error);
        });
    } else {
      setUserData(null);
    }
  }, [isAuthenticated]);

  const logout = () => {
    axios.get(server_url + '/logout', { withCredentials: true })
      .then(() => {
        setIsAuthenticated(false);
        setUserData(null);
      });
    window.location.href = 'http://localhost:3000/';
  };
  const getUserData = () => {
    setLoading(true);

    const cancelToken = axios.CancelToken.source();

    const requests = [
      axios.get(server_url + '/get/topTracks', {
        params: { timeRange: "long_term", limit: "50" },
        withCredentials: true,
        cancelToken: cancelToken.token,
      }).then((response) => {
        setYearSongs(JSON.parse(response.data.topTracks));
      }),

      axios.get(server_url + '/get/topTracks', {
        params: { timeRange: "medium_term", limit: "50" },
        withCredentials: true,
        cancelToken: cancelToken.token,
      }).then((response) => {
        setMonthSongs(JSON.parse(response.data.topTracks));
      }),

      axios.get(server_url + '/get/topTracks', {
        params: { timeRange: "short_term", limit: "50" },
        withCredentials: true,
        cancelToken: cancelToken.token,
      }).then((response) => {
        setWeekSongs(JSON.parse(response.data.topTracks));
      }),

      axios.get(server_url + '/get/topArtists', {
        params: { timeRange: "long_term", limit: "10" },
        withCredentials: true,
        cancelToken: cancelToken.token,
      }).then((response) => {
        setYearArtists(JSON.parse(response.data.topArtists));
        getYearTopSongs(JSON.parse(response.data.topArtists));
      }),

      axios.get(server_url + '/get/topArtists', {
        params: { timeRange: "medium_term", limit: "10" },
        withCredentials: true,
        cancelToken: cancelToken.token,
      }).then((response) => {
        setMonthArtists(JSON.parse(response.data.topArtists));
        getMonthTopSongs(JSON.parse(response.data.topArtists));
      }),

      axios.get(server_url + '/get/topArtists', {
        params: { timeRange: "short_term", limit: "10" },
        withCredentials: true,
        cancelToken: cancelToken.token,
      }).then((response) => {
        setWeekArtists(JSON.parse(response.data.topArtists));
        getWeekTopSongs(JSON.parse(response.data.topArtists));
      }),
    ];

    Promise.all(requests)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (axios.isCancel(error)) {
          console.log("Solicitud cancelada");
        } else {
          console.error("Error al obtener los datos:", error);
        }
      });
  };

  const getYearTopSongs = async (yearArtistsData) => {
    let artistsSongs = [];
  
    try {
      // Crea un array de promesas para todas las peticiones
      const promises = yearArtistsData.items.map(artist => {
        return axios.get(server_url + '/get/artists/topTracks', {
          params: { id: artist.id, name: artist.name },
          withCredentials: true
        });
      });
  
      // Espera a que todas las promesas se resuelvan
      const responses = await Promise.all(promises);
  
      // Combina los resultados en artistsSongs
      responses.forEach(response => {
        artistsSongs = artistsSongs.concat(JSON.parse(response.data.topTracks));
      });
  
      setYearArtistsSongs(artistsSongs);
      return artistsSongs; // Devuelve los datos si necesitas usarlos en otro lugar
    } catch (error) {
      console.error("Error al obtener las canciones principales:", error);
      return []; // Devuelve un array vacío en caso de error
    }
  };

  const getMonthTopSongs = async (monthArtistsData) => {
    let artistsSongs = [];
  
    try {
      // Crea un array de promesas para todas las peticiones
      const promises = monthArtistsData.items.map(artist => {
        return axios.get(server_url + '/get/artists/topTracks', {
          params: { id: artist.id, name: artist.name },
          withCredentials: true
        });
      });
  
      // Espera a que todas las promesas se resuelvan
      const responses = await Promise.all(promises);
  
      // Combina los resultados en artistsSongs
      responses.forEach(response => {
        artistsSongs = artistsSongs.concat(JSON.parse(response.data.topTracks));
      });
  
      setMonthArtistsSongs(artistsSongs);
      return artistsSongs; // Devuelve los datos si necesitas usarlos en otro lugar
    } catch (error) {
      console.error("Error al obtener las canciones principales:", error);
      return []; // Devuelve un array vacío en caso de error
    }
  };

  const getWeekTopSongs = async (weekArtistsData) => {
    let artistsSongs = [];
  
    try {
      // Crea un array de promesas para todas las peticiones
      const promises = weekArtistsData.items.map(artist => {
        return axios.get(server_url + '/get/artists/topTracks', {
          params: { id: artist.id, name: artist.name },
          withCredentials: true
        });
      });
  
      // Espera a que todas las promesas se resuelvan
      const responses = await Promise.all(promises);
  
      // Combina los resultados en artistsSongs
      responses.forEach(response => {
        artistsSongs = artistsSongs.concat(JSON.parse(response.data.topTracks));
      });
  
      setWeekArtistsSongs(artistsSongs);
      return artistsSongs; // Devuelve los datos si necesitas usarlos en otro lugar
    } catch (error) {
      console.error("Error al obtener las canciones principales:", error);
      return []; // Devuelve un array vacío en caso de error
    }
  };

  const hasExecuted = useRef(false);

  const hasRecommended = useRef(false)
  useEffect(() => {
    if (
      yearSongs && monthSongs && weekSongs &&
      yearArtistsSongs && monthArtistsSongs && weekArtistsSongs &&
      userData && !hasExecuted.current
    ) {
      hasExecuted.current = true;
      setProcessing(true);
      console.log("Guardando datos en la base de datos");

      const songsMap = new Map(); // Clave: song.id, Valor: canción

      // Recolectamos todas las canciones y evitamos duplicados
      const collectSongs = () => {
        // Canciones que le gustan al usuario directamente
        const likedUserSongs = [
          ...yearSongs.items,
          ...monthSongs.items,
          ...weekSongs.items
        ].map(song => ({
          ...song,
          desdeArtista: false
        }));

        // Canciones sugeridas por los artistas favoritos
        const likedArtistSongs = [
          ...yearArtistsSongs.flatMap(artist => artist.tracks),
          ...monthArtistsSongs.flatMap(artist => artist.tracks),
          ...weekArtistsSongs.flatMap(artist => artist.tracks)
        ].map(song => ({
          ...song,
          desdeArtista: true
        }));

        const allSongs = [...likedUserSongs, ...likedArtistSongs];

        for (const song of allSongs) {
          const existing = songsMap.get(song.id);

          if (!existing || (existing.desdeArtista === true && song.desdeArtista === false)) {
            songsMap.set(song.id, song);
          }
        }
      };

      const processAllSongs = async () => {
        collectSongs();

        const uniqueSongs = Array.from(songsMap.values());
        console.log(uniqueSongs);
        try {
          const response = await axios.post(`${server_url}/api/process-and-save`, {
            canciones: uniqueSongs,
            user: userData,
            withCredentials: true
          });
          setProcessing(false);
          setShowSuccess(true);
          console.log("✅ Canciones procesadas y guardadas:", response.data);
        } catch (error) {
          console.error("❌ Error al procesar canciones:", error);
        }
      };

      processAllSongs();
    }
  }, [yearSongs, monthSongs, weekSongs, yearArtistsSongs, monthArtistsSongs, weekArtistsSongs, userData]);

  useEffect(() => {
    console.log(hasRecommended.current)
    console.log(hasExecuted.current)
    if (!hasRecommended.current && hasExecuted.current && userData) {
      hasRecommended.current = true;
      getRecommendation();
    }
  }, [userData, hasExecuted, hasRecommended]);

  const getRecommendation = (feedback = null, song = null) => {
    console.log(`Feedback recibido: ${feedback}, canción: ${song}`);
    setRecommendedSong(null);
    setLoading(true);
    axios.get(server_url + "/api/get/recommendation", {
      params: {
        id: userData.id,
        feedback: feedback || undefined,
        cancion: JSON.stringify(song) || undefined
      }
    }).then((response) => {
      const songId = response.data.recomendaciones[0].spotify_id;

      axios.get(server_url + "/get/songInfo", {
        params: { id: encodeURIComponent(songId) },
        withCredentials: true
      }).then((response) => {
        const recommended = JSON.parse(response.data.track);
        setRecommendedSong(recommended);
        setLoading(false);
      });
    });
  };

  return (
    <div className="app-container">
      <nav className="navbar navbar-dark justify-content-between p-3">
        <div className="d-flex align-items-center">
          <img src={spotify} alt="Logo" className="logo" />
          <Link to='/' className="navbar-brand h1">SpotifAI</Link>
        </div>
        {isAuthenticated && !processing && showSuccess && (
          <div className="success-container" role="alert">
            Canciones procesadas correctamente.
            <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
          </div>
        )}
          {isAuthenticated && processing && (
            <div className="alert-container">
              <button
                type="button"
                className='button-alert'
                onClick={() => setShowWarning(!showWarning)}
                title="Ver mensaje"
              >
              <img src={alert}></img>
              </button>
              { showWarning && (
                <div className="alert-text-container" role="alert">
                  Procesando canciones, las recomendaciones seran menos precisas.
                </div>
              )}
            </div>
          )}

        <div>
          {!isAuthenticated || userData == null ? (
            <button onClick={login} className="btn btn-outline-light me-2 nav-btn">Log In</button>
          ) : (
            <div className="dropdown">
              <img src={userData.images[0].url} alt='AvatarUser' className='logo'></img>
              <button className="dropdown-toggle dropdown-button" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {userData.display_name}
              </button>
              <ul className="dropdown-menu">
                { isAdmin && (
                  <li><Link to="/admin" className="dropdown-item">Admin</Link></li>
                )}
                <li><Link to="/songs" className="dropdown-item">Canciones</Link></li>
                <li><Link to="/artists" className="dropdown-item">Artistas</Link></li>
                <li><button onClick={logout} className="dropdown-item" type="button">Log Out</button></li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {loading ? (
        <div className="main-content d-flex justify-content-center align-items-center">
          <div className="spinner-border spinner-custom" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path='/' element={
            <div className="main-content d-flex flex-column justify-content-center align-items-center text-center">
              <h2 className="text-light title">¿Estás buscando algo nuevo para escuchar?</h2>
              {!isAuthenticated ? (
                <button onClick={login} className="btn btn-success mt-4">Empezar a escuchar</button>
              ) : (
                <Link to="/recommender" className="btn btn-success mt-4">Empezar a escuchar</Link>
              )}
            </div>
          }></Route>
          <Route
            path='/songs'
            element={<Songs yearSongs={yearSongs} monthSongs={monthSongs} weekSongs={weekSongs} />}
          />
          <Route
            path='/artists'
            element={<Artists yearArtists={yearArtists} monthArtists={monthArtists} weekArtists={weekArtists} />}
          />
          <Route
            path='/recommender'
            element={<Recommender song={recommendedSong} userData={userData} updateRecommendation={getRecommendation} />}
          />
          <Route
            path='/admin'
            element={ <Admin/>}
          />
        </Routes>
      )}

      <footer>
        
      </footer>
    </div>
  );
}
