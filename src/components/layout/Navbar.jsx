import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onOpenComposer }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

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

        <NavLink to="/activity" className={({ isActive }) => isActive ? 'active' : ''} title="Activity">
          <i className="fa-regular fa-heart"></i><span>Activity</span>
        </NavLink>

        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} title="Dashboard">
          <i className="fa-solid fa-chart-line"></i><span>Dashboard</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} title="Profile">
          <i className="fa-regular fa-user"></i><span>Profile</span>
        </NavLink>
      </nav>

      <button className="primary-action" onClick={onOpenComposer} type="button">
        <i className="fa-regular fa-square-plus"></i>
        <span>Create</span>
      </button>

      <button 
        className="icon-button logout-btn" 
        onClick={handleLogout} 
        type="button" 
        title="Log out"
        style={{ marginTop: 'auto', marginBottom: '15px' }}
      >
        <i className="fa-solid fa-right-from-bracket"></i>
      </button>
    </aside>
  );
}
