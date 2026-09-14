import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function MobileNav({ onOpenComposer }) {
  const { currentUser } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotifs(snapshot.docs.length);
    }, () => {});

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} aria-label="Home">
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </NavLink>

      <NavLink to="/reels" className={({ isActive }) => isActive ? 'active' : ''} aria-label="Reels">
        <i className="fa-solid fa-clapperboard"></i>
        <span>Reels</span>
      </NavLink>

      <button type="button" onClick={onOpenComposer} aria-label="Create post">
        <i className="fa-regular fa-square-plus" style={{ color: 'var(--primary)' }}></i>
        <span>Create</span>
      </button>

      <NavLink to="/activity" className={({ isActive }) => isActive ? 'active' : ''} aria-label="Activity" style={{ position: 'relative' }}>
        <i className="fa-regular fa-heart"></i>
        <span>Activity</span>
        {unreadNotifs > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '12px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 6px var(--primary)'
          }}></span>
        )}
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} aria-label="Profile">
        <i className="fa-regular fa-user"></i>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
