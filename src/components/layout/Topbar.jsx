import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import UserCard from '../common/UserCard';

export default function Topbar({ title = "Home", subtitle = "Live social canvas", searchVal = "", onSearchChange }) {
  const { currentUser } = useAuth();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("orion-theme") === "dark");
  const [allUsers, setAllUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
      localStorage.setItem("orion-theme", "dark");
    } else {
      document.body.classList.remove("dark");
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
        <label className="search">
          <i className="fa-solid fa-magnifying-glass"></i>
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
            onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
          />
        </label>

        {/* Live Search Results Dropdown */}
        {showUserDropdown && searchVal.trim() && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow)',
            zIndex: 90, maxHeight: '320px', overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              Creators Found ({matchedUsers.length})
            </h4>

            {matchedUsers.length > 0 ? (
              matchedUsers.map(user => (
                <UserCard key={user.uid} user={user} />
              ))
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>
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
        title="Toggle theme"
      >
        <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
    </header>
  );
}
