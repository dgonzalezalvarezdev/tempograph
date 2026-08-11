import React, { useState } from 'react';
import '../styles/Artists.css';
import ArtistsCard from '../utils/ArtistsCard';

export default function Artists({ yearArtists, monthArtists, weekArtists }) {
  const [selectedRange, setSelectedRange] = useState('1 año');

  const timeRangeMap = {
    '1 año': yearArtists,
    '6 meses': monthArtists,
    '1 mes': weekArtists,
  };

  const handleTimeRangeChange = (event) => {
    setSelectedRange(event.target.value);
  };

  const currentArtists = timeRangeMap[selectedRange];

  const formatFollowers = (followers) => {
    return new Intl.NumberFormat('es-ES').format(followers);
  };

  const capitalizeGenres = (genres) => {
    return genres.map((genre) => genre.charAt(0).toUpperCase() + genre.slice(1)).join(', ');
  };

  return (
    <div className="artists-container main-content d-flex flex-column align-items-center text-center">
      <h2 className="text-light title">Artistas Más Escuchados</h2>
      <div className="filter-container">
        <label htmlFor="timeRange" className="text-light subtitle">
          Tus artistas más escuchados en:
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
      <div className="artists-list">
        {currentArtists && currentArtists.items.length > 0 ? (
          currentArtists.items.map((artist, index) => (
            <ArtistsCard
              key={index}
              name={artist.name}
              genres={capitalizeGenres(artist.genres)}
              followers={`${formatFollowers(artist.followers.total)} followers`}
              imageUrl={artist.images[0]?.url || ''}
              urlSpotify={artist.external_urls.spotify}
            />
          ))
        ) : (
          <p>No hay artistas disponibles.</p>
        )}
      </div>
    </div>
  );
}
