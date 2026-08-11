import React from 'react';
import '../styles/TrackCard.css';

export default function TrackCard({ title, artists, album, duration, imageUrl, urlSpotify }) {
    return (
        <div className="track-card">
            <img src={imageUrl} alt="Album Cover" className="track-image" />
            <div className="track-details">
                <a href={urlSpotify} target='_blank' rel='noopener noreferrer' className="track-title">{title}</a>
                <p className="track-artists">{artists}</p>
                <p className="track-album">{album}</p>
                <p className="track-duration">{duration}</p>
            </div>
        </div>
    );
}
