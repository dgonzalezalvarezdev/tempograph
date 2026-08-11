import React, { useState } from 'react';
import '../styles/Songs.css';
import TrackCard from '../utils/TrackCard';

export default function Songs({ yearSongs, monthSongs, weekSongs }) {
  const [selectedRange, setSelectedRange] = useState('1 año');
  const timeRangeMap = {
    '1 año': yearSongs,
    '6 meses': monthSongs,
    '1 mes': weekSongs,
  };

  const handleTimeRangeChange = (event) => {
    setSelectedRange(event.target.value);
  };

  const currentTracks = timeRangeMap[selectedRange]?.items.slice(0, 10);

  return (
    <div className="songs-container main-content d-flex flex-column align-items-center text-center">
      <h2 className="text-light title">Canciones Más Escuchadas</h2>
      <div className="filter-container">
        <label htmlFor="timeRange" className="text-light subtitle">
          Tus canciones más escuchadas en:
        </label>
        <select
          id="timeRange"
          className="time-range-select"
          value={selectedRange}
          onChange={handleTimeRangeChange}
        >
          <option value="1 año">Último año</option>
          <option value="6 meses">Últimos 6 meses</option>
          <option value="1 mes">Último mes</option>
        </select>
      </div>
      <div className="songs-list">
        {currentTracks && currentTracks.length > 0 ? (
            currentTracks.map((track, index) => (
            <TrackCard
                key={index}
                title={track.name}
                artists={track.artists.map((artist) => artist.name).join(', ')}
                album={track.album.name}
                duration={formatDuration(track.duration_ms)}
                imageUrl={track.album.images[0].url}
                urlSpotify={track.external_urls.spotify}
            />
            ))
        ) : (
            <p>No hay canciones disponibles.</p>
        )}
        </div>
    </div>
  );
}

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
