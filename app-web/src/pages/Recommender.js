import { useEffect } from 'react';
import RecommendedSongCard from '../utils/RecommendedSongCard';

export default function Recommender({ song, userData, updateRecommendation }) {
  useEffect(() => {
    if (!song) {
      updateRecommendation();
    }
  }, [song, updateRecommendation]);

  const formattedSong = song && {
    name: song.name,
    artists: song.artists.map((artist) => artist.name),
    album: song.album.name,
    duration: song.duration_ms,
    image: song.album.images[0]?.url,
    preview: song.external_urls["spotify"],
    id: song.id
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
      {!song ? (
        <h2 className="text-light">Cargando canción recomendada...</h2>
      ) : (
        <RecommendedSongCard
          song={formattedSong}
          userId={userData.id}
          updateRecommendation={updateRecommendation}
        />
      )}
    </div>
  );
}
