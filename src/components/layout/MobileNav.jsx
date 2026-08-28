import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function MobileNav({ onOpenComposer }) {
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
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </NavLink>

      <NavLink to="/reels" className={({ isActive }) => isActive ? 'active' : ''}>
        <i className="fa-solid fa-clapperboard"></i>
        <span>Reels</span>
      </NavLink>

      <button type="button" onClick={onOpenComposer}>
        <i className="fa-regular fa-square-plus"></i>
        <span>Create</span>
      </button>

      <NavLink to="/activity" className={({ isActive }) => isActive ? 'active' : ''}>
        <i className="fa-regular fa-heart"></i>
        <span>Activity</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
        <i className="fa-regular fa-user"></i>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
