import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import UserCard from '../common/UserCard';

export default function Sidebar() {
  const { currentUser, userProfile } = useAuth();
  const [discoverUsers, setDiscoverUsers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser?.uid);
      setDiscoverUsers(users);
    }, (err) => {
      console.log('Error fetching discover users:', err.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <aside className="sidebar">
      <section className="panel profile-panel" id="profile">
        <div className="profile-mini">
          <Avatar src={userProfile?.avatar} alt={userProfile?.name} />
          <div>
            <h2>{userProfile?.name || "User"}</h2>
            <p>{userProfile?.handle || "@user"}</p>
          </div>
        </div>
        <p className="profile-bio-mini">
          {userProfile?.bio || "Digital creator on ORION Social."}
        </p>
        <div className="mini-stats">
          <div><b>{userProfile?.postsCount || 0}</b><span>Posts</span></div>
          <div><b>{userProfile?.followersCount || 0}</b><span>Followers</span></div>
          <div><b>{userProfile?.followingCount || 0}</b><span>Following</span></div>
        </div>
        <Link className="panel-button" to="/profile">View profile</Link>
      </section>

      <section className="panel" id="discover">
        <div className="panel-heading">
          <h2>Discover Creators</h2>
        </div>
        {discoverUsers.length > 0 ? (
          <div>
            {discoverUsers.map(user => (
              <UserCard key={user.uid} user={user} />
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
            <i className="fa-solid fa-users" style={{ fontSize: '24px', marginBottom: '8px', display: 'block', color: 'var(--primary)' }}></i>
            No other creators yet.<br />Invite friends to join ORION!
          </div>
        )}
      </section>

      <section className="panel" id="messages">
        <div className="panel-heading">
          <h2>Messages</h2>
          <Link to="/chat">Open</Link>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
          No recent messages
        </div>
      </section>

      <section className="panel" id="activity">
        <div className="panel-heading">
          <h2>Activity</h2>
          <Link to="/activity">View</Link>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
          No recent activity
        </div>
      </section>
    </aside>
  );
}
