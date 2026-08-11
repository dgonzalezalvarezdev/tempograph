import React from 'react';
import '../styles/ArtistsCard.css';

export default function TrackCard({ name, genres, followers, imageUrl, urlSpotify }) {
    return (
        <div className="track-card">
            <img src={imageUrl} alt="Album Cover" className="track-image" />
            <div className="track-details">
                <a href={urlSpotify} target='_blank' rel='noopener noreferrer' className="track-title">{name}</a>
                <p className="track-genres">{genres}</p>
                <p className="track-followers">{followers}</p>
            </div>
        </div>
    );
}
