import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import PostCard from '../components/feed/PostCard';
import Avatar from '../components/common/Avatar';

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'posts'),
      where('authorUid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Listener: User Posts | Triggers on own post create/update/delete | ~1 read per own post change
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPosts(posts);
      setStats(prev => ({ ...prev, posts: posts.length }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <Topbar title="Profile" subtitle="Your creator space" />

        <div className="profile-header" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
          borderRadius: '20px', padding: '30px', marginBottom: '20px', position: 'relative'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Avatar src={userProfile?.avatar} alt={userProfile?.name} size="large" />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{userProfile?.name || 'Creator'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0' }}>{userProfile?.handle || '@user'}</p>
              <p style={{ margin: '8px 0 0', maxWidth: '400px', lineHeight: 1.5 }}>
                {userProfile?.bio || 'Digital creator on ORION Social.'}
              </p>
            </div>
          </div>

          <div className="profile-stats" style={{
            display: 'flex', gap: '30px', marginTop: '20px', paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <b style={{ fontSize: '20px', display: 'block' }}>{stats.posts}</b>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Posts</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <b style={{ fontSize: '20px', display: 'block' }}>{stats.followers}</b>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Followers</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <b style={{ fontSize: '20px', display: 'block' }}>{stats.following}</b>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Following</span>
            </div>
          </div>
        </div>

        <h3 style={{ margin: '20px 0 15px', fontSize: '18px' }}>Your Posts</h3>

        <section className="feed-list">
          {loading ? (
            <article className="post"><div className="post-copy"><b>Loading your posts...</b></div></article>
          ) : userPosts.length > 0 ? (
            userPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <article className="post">
              <div className="post-copy">
                <b>No posts yet</b>
                <p>Create your first post to get started!</p>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
