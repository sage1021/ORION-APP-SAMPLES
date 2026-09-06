import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import UserCard from '../common/UserCard';

export default function Topbar({ title = "Home", subtitle = "Live social canvas", searchVal = "", onSearchChange }) {
  const { currentUser } = useAuth();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("orion-theme") !== "light");
  const [allUsers, setAllUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove("light");
      localStorage.setItem("orion-theme", "dark");
    } else {
      document.body.classList.add("light");
      localStorage.setItem("orion-theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser?.uid);
      setAllUsers(users);
    }, (err) => {
      console.log('Error fetching search users:', err.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const matchedUsers = searchVal.trim()
    ? allUsers.filter(u =>
        u.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        u.handle?.toLowerCase().includes(searchVal.toLowerCase())
      )
    : [];

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h1>{title}</h1>
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <label className="search" htmlFor="searchInput">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            id="searchInput"
            type="search"
            placeholder="Search creators, tags, posts"
            value={searchVal}
            onChange={(e) => {
              onSearchChange && onSearchChange(e.target.value);
              setShowUserDropdown(true);
            }}
            onFocus={() => setShowUserDropdown(true)}
            onBlur={() => setTimeout(() => setShowUserDropdown(false), 250)}
            onKeyDown={(e) => e.key === 'Escape' && setShowUserDropdown(false)}
            aria-label="Search"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '4px',
                fontSize: '0.85rem'
              }}
              title="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </label>

        {/* Live Search Results Dropdown Overlay */}
        {showUserDropdown && searchVal.trim() && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
            background: 'var(--surface-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '12px', boxShadow: 'var(--shadow-hover)',
            zIndex: 90, maxHeight: '340px', overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em' }}>
                Creators ({matchedUsers.length})
              </span>
            </div>

            {matchedUsers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {matchedUsers.map(user => (
                  <UserCard key={user.uid} user={user} />
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', textAlign: 'center', padding: '14px 0' }}>
                No creators match "{searchVal}"
              </p>
            )}
          </div>
        )}
      </div>

      <button 
        className="icon-button" 
        onClick={() => setIsDark(!isDark)} 
        type="button" 
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
    </header>
  );
}
