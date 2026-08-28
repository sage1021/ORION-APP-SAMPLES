import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Avatar from '../components/common/Avatar';
import ComposerModal from '../components/feed/ComposerModal';

export default function Reels() {
  const { currentUser, userProfile } = useAuth();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState({});
  const [followingMap, setFollowingMap] = useState({});
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeComments, setActiveComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  // Fetch real video reels from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('videoUrl', '!=', ''),
      orderBy('videoUrl'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreReels = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReels(firestoreReels);
      } else {
        setReels([]);
      }
    }, (err) => {
      console.log('No video reels found:', err.message);
      setReels([]);
    });

    return () => unsubscribe();
  }, []);

  // Control video playback based on active reel index
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
      }
    });
  }, [currentIndex, reels]);

  // Load comments for active reel
  useEffect(() => {
    const currentReel = reels[currentIndex];
    if (!currentReel || currentReel.id.startsWith('sample-')) {
      setActiveComments([
        { id: 'c1', userName: 'Maya Lee', userAvatar: '/media/halo.jpg', text: 'This lighting and transition is insane 🔥', time: '12m ago' },
        { id: 'c2', userName: 'Devon Reed', userAvatar: '/media/lagbaja.jpg', text: 'Where did you get the audio stem for this?', time: '45m ago' },
        { id: 'c3', userName: 'Kai Walker', userAvatar: '/media/meme 2 naruto.jpg', text: '10/10 execution keep building!', time: '2h ago' }
      ]);
      return;
    }

    const q = query(
      collection(db, 'posts', currentReel.id, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveComments(msgs);
    });

    return () => unsubscribe();
  }, [currentIndex, reels]);

  function handleScroll(e) {
    const container = e.target;
    const itemHeight = container.clientHeight;
    if (!itemHeight) return;
    const newIdx = Math.round(container.scrollTop / itemHeight);
    if (newIdx !== currentIndex && newIdx >= 0 && newIdx < reels.length) {
      setCurrentIndex(newIdx);
    }
  }

  function togglePlayPause(idx) {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function toggleLike(reelId) {
    const isLiked = !!likedMap[reelId];
    setLikedMap(prev => ({ ...prev, [reelId]: !isLiked }));

    // Optimistically update counts
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        return { ...r, likesCount: Math.max(0, (r.likesCount || 0) + (isLiked ? -1 : 1)) };
      }
      return r;
    }));

    if (!reelId.startsWith('sample-')) {
      const postRef = doc(db, 'posts', reelId);
      updateDoc(postRef, {
        likesCount: increment(isLiked ? -1 : 1)
      }).catch(console.error);
    }
  }

  function toggleFollow(authorUid) {
    setFollowingMap(prev => ({ ...prev, [authorUid]: !prev[authorUid] }));
  }

  async function handleSendComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const currentReel = reels[currentIndex];
    const commentData = {
      text: newComment.trim(),
      authorUid: currentUser?.uid || 'guest',
      userName: userProfile?.name || 'Creator',
      userAvatar: userProfile?.avatar || '/media/HIM.jpeg',
      time: 'Just now',
      createdAt: serverTimestamp()
    };

    if (currentReel && !currentReel.id.startsWith('sample-')) {
      await addDoc(collection(db, 'posts', currentReel.id, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', currentReel.id), { commentsCount: increment(1) });
    } else {
      setActiveComments(prev => [...prev, { ...commentData, id: Date.now().toString() }]);
    }

    setNewComment('');
  }

  function handleShare(reel) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  }

  return (
    <div className="app-shell" style={{ maxWidth: '100vw', padding: 0 }}>
      <Navbar />

      <main className="content" style={{ display: 'flex', justifyContent: 'center', height: '100vh', padding: 0, overflow: 'hidden', background: '#0a0a0f' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '440px', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '0.05em', color: '#fff' }}>
              ORION REELS
            </h2>
            <button
              onClick={() => setMuted(!muted)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%', width: '36px', height: '36px', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={muted ? 'Unmute' : 'Mute'}
            >
              <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
            </button>
          </div>

          {/* Toast Notification */}
          {copiedToast && (
            <div style={{
              position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(99,102,241,0.95)', color: '#fff', padding: '8px 18px',
              borderRadius: '20px', fontSize: '13px', fontWeight: 600, zIndex: 50,
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)', pointerEvents: 'none'
            }}>
              <i className="fa-solid fa-link" style={{ marginRight: '6px' }}></i> Link copied to clipboard!
            </div>
          )}

          {/* Reels Snap Scroll Feed or Empty State */}
          {reels.length > 0 ? (
            <div
              ref={containerRef}
              onScroll={handleScroll}
              style={{
                width: '100%', height: '100%', overflowY: 'scroll',
                scrollSnapType: 'y mandatory', scrollbarWidth: 'none'
              }}
            >
              {reels.map((reel, idx) => {
                const isLiked = !!likedMap[reel.id];
                const isFollowing = !!followingMap[reel.authorUid];

                return (
                  <div
                    key={reel.id}
                    style={{
                      position: 'relative', width: '100%', height: '100%',
                      scrollSnapAlign: 'start', background: '#111',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <video
                      ref={el => videoRefs.current[idx] = el}
                      src={reel.videoUrl}
                      loop
                      muted={muted}
                      playsInline
                      onClick={() => togglePlayPause(idx)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    />

                    {/* Play/Pause Center Indicator */}
                    {!isPlaying && idx === currentIndex && (
                      <div
                        onClick={() => togglePlayPause(idx)}
                        style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          width: '70px', height: '70px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '28px', pointerEvents: 'none'
                        }}
                      >
                        <i className="fa-solid fa-play" style={{ marginLeft: '4px' }}></i>
                      </div>
                    )}

                    {/* Right Action Bar */}
                    <div style={{
                      position: 'absolute', right: '14px', bottom: '80px', zIndex: 25,
                      display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center'
                    }}>
                      {/* Like Action */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => toggleLike(reel.id)}
                          style={{
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: 'none', borderRadius: '50%', width: '46px', height: '46px',
                            color: isLiked ? '#ef4444' : '#fff', fontSize: '20px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                        </button>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                          {reel.likesCount || 0}
                        </span>
                      </div>

                      {/* Comments Action */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => setCommentsOpen(true)}
                          style={{
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: 'none', borderRadius: '50%', width: '46px', height: '46px',
                            color: '#fff', fontSize: '19px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <i className="fa-solid fa-comment-dots"></i>
                        </button>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                          {reel.commentsCount || activeComments.length}
                        </span>
                      </div>

                      {/* Share Action */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleShare(reel)}
                          style={{
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: 'none', borderRadius: '50%', width: '46px', height: '46px',
                            color: '#fff', fontSize: '18px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <i className="fa-solid fa-share-nodes"></i>
                        </button>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                          {reel.sharesCount || 0}
                        </span>
                      </div>

                      {/* Music Spinning Disc */}
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: 'radial-gradient(circle, #333 30%, #111 70%)',
                        border: '2px solid rgba(255,255,255,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: isPlaying ? 'spinRing 3s linear infinite' : 'none',
                        marginTop: '8px'
                      }}>
                        <i className="fa-solid fa-music" style={{ color: '#deb887', fontSize: '13px' }}></i>
                      </div>
                    </div>

                    {/* Bottom Creator Info & Caption */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: '70px', zIndex: 20,
                      padding: '20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                      color: '#fff'
                    }}>
                      {/* Creator Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Avatar src={reel.userAvatar} size="small" />
                        <div>
                          <b style={{ fontSize: '15px', color: '#fff', display: 'block' }}>{reel.userName}</b>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{reel.handle}</span>
                        </div>
                        <button
                          onClick={() => toggleFollow(reel.authorUid)}
                          style={{
                            marginLeft: '8px', padding: '4px 12px', borderRadius: '16px',
                            border: isFollowing ? '1px solid rgba(255,255,255,0.4)' : 'none',
                            background: isFollowing ? 'transparent' : '#deb887',
                            color: isFollowing ? '#fff' : '#1c1917',
                            fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>

                      {/* Caption */}
                      <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.4, color: 'rgba(255,255,255,0.92)' }}>
                        {reel.caption || reel.text}
                      </p>

                      {/* Music track ticker */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                        <i className="fa-solid fa-music"></i>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {reel.musicTrack || 'Original Audio • Orion Sound'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: '#fff', textAlign: 'center', padding: '20px'
            }}>
              <i className="fa-solid fa-clapperboard" style={{ fontSize: '48px', marginBottom: '16px', color: '#deb887' }}></i>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>No Reels Yet</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', maxWidth: '280px', margin: '0 0 20px' }}>
                Be the first creator to upload a video reel to ORION!
              </p>
              <button
                onClick={() => setComposerOpen(true)}
                style={{
                  padding: '10px 24px', borderRadius: '24px', border: 'none',
                  background: '#deb887', color: '#1c1917', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Create Reel
              </button>
            </div>
          )}

          {/* Comments Bottom Drawer / Modal */}
          {commentsOpen && (
            <div
              onClick={(e) => e.target === e.currentTarget && setCommentsOpen(false)}
              style={{
                position: 'absolute', inset: 0, zIndex: 60,
                background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
              }}
            >
              <div style={{
                background: '#18181b', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                height: '65%', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {/* Comments Header */}
                <div style={{
                  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    Comments ({activeComments.length})
                  </h3>
                  <button
                    onClick={() => setCommentsOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '18px', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* Comments List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeComments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Avatar src={c.userAvatar} size="small" />
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <b style={{ fontSize: '13px', color: '#fff' }}>{c.userName || 'Creator'}</b>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{c.time || 'recent'}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSendComment} style={{
                  padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', gap: '10px', alignItems: 'center'
                }}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: '13px', outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px', borderRadius: '20px', border: 'none',
                      background: '#deb887', color: '#1c1917', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}
