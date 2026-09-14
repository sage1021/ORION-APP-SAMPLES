import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import PostCard from '../components/feed/PostCard';
import Avatar from '../components/common/Avatar';
import { PostSkeleton } from '../components/common/Skeleton';
import ComposerModal from '../components/feed/ComposerModal';
import EditProfileModal from '../components/profile/EditProfileModal';
import MobileNav from '../components/layout/MobileNav';

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [composerOpen, setComposerOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'posts'),
      where('authorUid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPosts(posts);
      setLoading(false);
    }, (err) => {
      console.log('Error fetching user posts:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const mediaPosts = userPosts.filter(p => p.imageUrl || p.videoUrl);

  return (
    <div className="app-shell">
      <Navbar onOpenComposer={() => setComposerOpen(true)} />

      <main className="content">
        <Topbar title="Profile" subtitle="Personal creator space" />

        {/* Cinematic Profile Header */}
        <section className="profile-page-header" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <Avatar src={userProfile?.avatar} alt={userProfile?.name} size="large" />
            <button
              onClick={() => setEditProfileOpen(true)}
              style={{
                position: 'absolute', bottom: '0', right: '0', width: '28px', height: '28px',
                borderRadius: '50%', background: 'var(--primary)', color: '#ffffff',
                border: '2px solid var(--surface)', cursor: 'pointer', display: 'grid',
                placeItems: 'center', fontSize: '0.75rem', boxShadow: 'var(--shadow-sm)'
              }}
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <i className="fa-solid fa-pencil"></i>
            </button>
          </div>
          
          <div>
            <h2>{userProfile?.name || 'Creator'}</h2>
            <span className="handle">{userProfile?.handle || '@creator'}</span>
          </div>

          <p className="bio">
            {userProfile?.bio || 'Digital creator building worlds and sharing visions on ORION Social.'}
          </p>

          <div className="profile-stats-grid">
            <div>
              <b>{userPosts.length}</b>
              <span>Posts</span>
            </div>
            <div>
              <b>{userProfile?.followersCount || 0}</b>
              <span>Followers</span>
            </div>
            <div>
              <b>{userProfile?.followingCount || 0}</b>
              <span>Following</span>
            </div>
          </div>

          <button
            onClick={() => setEditProfileOpen(true)}
            type="button"
            style={{
              marginTop: '12px',
              padding: '8px 22px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: 'var(--surface-soft)',
              color: 'var(--text)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.18s var(--ease-spring)'
            }}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            Edit Profile
          </button>
        </section>

        {/* Profile Tabs */}
        <div className="feed-tools" style={{ marginTop: '4px' }}>
          <div className="tabs" role="tablist">
            <button
              className={activeTab === 'posts' ? 'active' : ''}
              onClick={() => setActiveTab('posts')}
              type="button"
            >
              <i className="fa-solid fa-layer-group" style={{ marginRight: '6px' }}></i> All Posts ({userPosts.length})
            </button>
            <button
              className={activeTab === 'media' ? 'active' : ''}
              onClick={() => setActiveTab('media')}
              type="button"
            >
              <i className="fa-solid fa-photo-film" style={{ marginRight: '6px' }}></i> Media ({mediaPosts.length})
            </button>
          </div>
        </div>

        {/* Posts Feed or Media */}
        <section className="feed-list" style={{ marginTop: '16px' }}>
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : (activeTab === 'posts' ? userPosts : mediaPosts).length > 0 ? (
            (activeTab === 'posts' ? userPosts : mediaPosts).map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>No {activeTab} yet</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.88rem' }}>
                Your published {activeTab === 'posts' ? 'updates' : 'photos and clips'} will show up here.
              </p>
              <button
                onClick={() => setComposerOpen(true)}
                type="button"
                style={{
                  marginTop: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Create Post
              </button>
            </div>
          )}
        </section>
      </main>

      <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      <MobileNav onOpenComposer={() => setComposerOpen(true)} />
    </div>
  );
}
