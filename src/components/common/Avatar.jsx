import React from 'react';

export default function Avatar({ src, alt = "User avatar", size = "medium", className = "" }) {
  const defaultSrc = "/media/HIM.jpeg";
  const avatarSrc = src || defaultSrc;

  return (
    <img 
      src={avatarSrc} 
      alt={alt} 
      className={`avatar avatar-${size} ${className}`}
      onError={(e) => { e.target.src = defaultSrc; }}
    />
  );
}
