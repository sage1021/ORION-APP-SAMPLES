import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import PostCard from '../components/feed/PostCard';
import ComposerModal from '../components/feed/ComposerModal';
import MobileNav from '../components/layout/MobileNav';
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

        <section className="stories" aria-label="Stories">
          <button className="story add" onClick={() => setComposerOpen(true)} type="button">
            <span><i className="fa-solid fa-plus"></i></span>
            <b>Create</b>
          </button>
        </section>

        <section className="composer-card" aria-label="Create a post">
          <img src={userProfile?.avatar || '/media/HIM.jpeg'} alt={userProfile?.name || 'You'} />
          <button onClick={() => setComposerOpen(true)} type="button">
            What's happening in your orbit, {userProfile?.name || 'Creator'}?
          </button>
        </section>

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
            {loading ? 'Loading...' : `Showing ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`}
          </p>
        </section>

        <section className="feed-list" id="feedList" aria-live="polite">
          {loading ? (
            <article className="post"><div className="post-copy"><b>Loading posts...</b></div></article>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <article className="post">
              <div className="post-copy">
                <b>No matches yet</b>
                <p>Try a different search or feed filter.</p>
              </div>
            </article>
          )}
        </section>
      </main>

      <Sidebar />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      <MobileNav onOpenComposer={() => setComposerOpen(true)} />
    </div>
  );
}
