import React from 'react';

export default function SplashScreen({ fadeOut = false }) {
  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <div className="splash-logo-glow" />
          <img
            src="/media/MINI_LOGO no bg.png"
            alt="ORION"
            className="splash-logo-img"
            onError={(e) => {
              e.currentTarget.src = '/media/MINI LOGO 1.jpg';
            }}
          />
        </div>
        <div className="splash-wordmark">ORION</div>
        <div className="splash-tagline">Discover. Create. Connect.</div>
        <div className="loading-ring" aria-label="Loading ORION..." />
      </div>
    </div>
  );
}

