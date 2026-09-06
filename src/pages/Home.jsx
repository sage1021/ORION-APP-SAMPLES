import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import PostCard from '../components/feed/PostCard';
import ComposerModal from '../components/feed/ComposerModal';
import MobileNav from '../components/layout/MobileNav';
import { PostSkeleton } from '../components/common/Skeleton';
import usePosts from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [composerOpen, setComposerOpen] = useState(false);

  const { posts, loading } = usePosts(activeFilter);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const searchable = `${post.userName || ''} ${post.handle || ''} ${post.text || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
    return searchable.includes(searchQuery.toLowerCase());
  });

  const filters = [
    { key: 'all', label: 'For You' },
    { key: 'art', label: 'Art' },
    { key: 'music', label: 'Music' },
    { key: 'anime', label: 'Anime' }
  ];

  return (
    <div className="app-shell">
      <Navbar onOpenComposer={() => setComposerOpen(true)} />

      <main className="content">
        <Topbar
          title="Home"
          subtitle="Live social canvas"
          searchVal={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <section className="hero-strip" aria-label="Featured conversation">
          <img src="/media/ORION logo GRADIENT.png" alt="ORION gradient logo" />
          <div>
            <p className="eyebrow">Featured Today</p>
            <h2>Creators are building worlds in public.</h2>
            <p>Follow new drops, behind-the-scenes clips, and sharp conversations from the ORION community.</p>
          </div>
        </section>

        {/* Stories Bar */}
        <section className="stories" aria-label="Stories">
          <button className="story" onClick={() => setComposerOpen(true)} type="button" aria-label="Create story">
            <span><i className="fa-solid fa-plus"></i></span>
            <b>Create</b>
          </button>
        </section>

        {/* Quick Composer Card */}
        <section className="composer-card" aria-label="Create a post">
          <img src={userProfile?.avatar || '/media/HIM.jpeg'} alt={userProfile?.name || 'You'} />
          <button onClick={() => setComposerOpen(true)} type="button">
            What's happening in your orbit, {userProfile?.name || 'Creator'}?
          </button>
        </section>

        {/* Feed Filter Tools */}
        <section className="feed-tools" id="feed">
          <div className="tabs" role="tablist" aria-label="Feed filters">
            {filters.map(f => (
              <button
                key={f.key}
                className={activeFilter === f.key ? 'active' : ''}
                onClick={() => setActiveFilter(f.key)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
          <p id="resultCount">
            {loading ? 'Fetching feed...' : `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`}
          </p>
        </section>

        {/* Feed List with Shimmer Skeletons */}
        <section className="feed-list" id="feedList" aria-live="polite">
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => <PostCard key={post.id} post={post} />)
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
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--surface-soft)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--primary)',
                fontSize: '1.4rem'
              }}>
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>No posts found</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '320px' }}>
                {searchQuery ? `No posts matching "${searchQuery}". Try a different term or filter.` : 'Be the first to share an update, art drop, or video on ORION.'}
              </p>
              <button
                onClick={() => setComposerOpen(true)}
                type="button"
                style={{
                  marginTop: '8px',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Create a Post
              </button>
            </div>
          )}
        </section>
      </main>

      <Sidebar />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      <MobileNav onOpenComposer={() => setComposerOpen(true)} />
    </div>
  );
}
