import React from 'react';

export default function SplashScreen() {
  return (
    <div className="splash-screen" style={{ opacity: 1, pointerEvents: 'auto' }}>
      <div className="splash-content">
        <img src="/media/MINI_LOGO no bg.png" alt="ORION" />
        <div className="splash-wordmark">ORION</div>
        <div className="loading-ring" aria-hidden="true"></div>
      </div>
    </div>
  );
}
