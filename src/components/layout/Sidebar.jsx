import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import UserCard from '../common/UserCard';
import { UserCardSkeleton } from '../common/Skeleton';

export default function Sidebar() {
  const { currentUser, userProfile } = useAuth();
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(8));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser?.uid);
      setDiscoverUsers(users);
      setLoading(false);
    }, (err) => {
      console.log('Error fetching discover users:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <aside className="sidebar" aria-label="Secondary navigation and creator discovery">
      {/* Mini Profile Identity Card */}
      <section className="panel profile-panel" id="profile">
        <div className="profile-mini">
          <Avatar src={userProfile?.avatar} alt={userProfile?.name} size="medium" />
          <div>
            <h2>{userProfile?.name || "User"}</h2>
            <p>{userProfile?.handle || "@creator"}</p>
          </div>
        </div>
        
        <p className="profile-bio-mini">
          {userProfile?.bio || "Digital creator building worlds on ORION."}
        </p>

        <div className="mini-stats">
          <div><b>{userProfile?.postsCount || 0}</b><span>Posts</span></div>
          <div><b>{userProfile?.followersCount || 0}</b><span>Followers</span></div>
          <div><b>{userProfile?.followingCount || 0}</b><span>Following</span></div>
        </div>

        <Link className="panel-button" to="/profile">View Profile</Link>
      </section>

      {/* Discover Creators Panel */}
      <section className="panel" id="discover">
        <div className="panel-heading">
          <h2>Discover Creators</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </div>
        ) : discoverUsers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {discoverUsers.map(user => (
              <UserCard key={user.uid} user={user} />
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--muted)', fontSize: '0.84rem', textAlign: 'center', padding: '18px 0' }}>
            <i className="fa-solid fa-users" style={{ fontSize: '1.4rem', marginBottom: '8px', display: 'block', color: 'var(--primary)' }}></i>
            No other creators yet.<br />Invite friends to join ORION!
          </div>
        )}
      </section>

      {/* Shortcuts */}
      <section className="panel" id="messages">
        <div className="panel-heading">
          <h2>Direct Messages</h2>
          <Link to="/chat">Open</Link>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.82rem', textAlign: 'center', padding: '8px 0' }}>
          Real-time conversations
        </div>
      </section>
    </aside>
  );
}
