import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onOpenComposer }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
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

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <aside className="rail" aria-label="Primary navigation">
      <Link className="brand" to="/" aria-label="ORION home">
        <img src="/media/MINI_LOGO no bg.png" alt="ORION Logo" />
        <span>ORION</span>
      </Link>

      <nav className="rail-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} title="Home">
          <i className="fa-solid fa-house"></i><span>Home</span>
        </NavLink>

        <NavLink to="/reels" className={({ isActive }) => isActive ? 'active' : ''} title="Reels">
          <i className="fa-solid fa-clapperboard"></i><span>Reels</span>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''} title="Messages">
          <i className="fa-regular fa-paper-plane"></i><span>Messages</span>
        </NavLink>

        <NavLink to="/activity" className={({ isActive }) => isActive ? 'active' : ''} title="Activity" style={{ position: 'relative' }}>
          <i className="fa-regular fa-heart"></i>
          <span>Activity</span>
          {unreadNotifs > 0 && (
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 8px var(--primary)'
            }}></span>
          )}
        </NavLink>

        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} title="Dashboard">
          <i className="fa-solid fa-chart-line"></i><span>Dashboard</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} title="Profile">
          <i className="fa-regular fa-user"></i><span>Profile</span>
        </NavLink>
      </nav>

      <button className="primary-action" onClick={onOpenComposer} type="button" aria-label="Create new post">
        <i className="fa-regular fa-square-plus"></i>
        <span>Create</span>
      </button>

      <button 
        className="icon-button logout-btn" 
        onClick={handleLogout} 
        type="button" 
        title="Log out"
        style={{ marginTop: 'auto', marginBottom: '8px' }}
        aria-label="Log out"
      >
        <i className="fa-solid fa-right-from-bracket"></i>
      </button>
    </aside>
  );
}
