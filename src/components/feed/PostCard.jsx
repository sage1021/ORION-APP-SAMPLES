import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { CommentSkeleton } from '../common/Skeleton';

function timeAgo(timestamp) {
  if (!timestamp) return "Just now";
  const ms = timestamp.seconds ? timestamp.seconds * 1000 : (timestamp.toMillis ? timestamp.toMillis() : timestamp);
  const minutes = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function formatCount(value) {
  if (!value) return 0;
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
}

export default function PostCard({ post }) {
  const { currentUser, userProfile } = useAuth();
  const [liked, setLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [saved, setSaved] = useState(post.isSavedByCurrentUser || false);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Inline Comment Drawer State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Optimistic Like Handler
  async function handleToggleLike() {
    if (!currentUser || isLiking) return;
    setIsLiking(true);

    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const postRef = doc(db, 'posts', post.id);
      const likeRef = doc(db, 'posts', post.id, 'likes', currentUser.uid);

      if (!prevLiked) {
        await setDoc(likeRef, { createdAt: new Date(), uid: currentUser.uid });
        await updateDoc(postRef, { likesCount: increment(1) });
      } else {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  }

  // Optimistic Bookmark Handler
  async function handleToggleSave() {
    if (!currentUser) return;
    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const saveRef = doc(db, 'users', currentUser.uid, 'savedPosts', post.id);
      if (!prevSaved) {
        await setDoc(saveRef, { postId: post.id, savedAt: new Date() });
      } else {
        await deleteDoc(saveRef);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setSaved(prevSaved);
    }
  }

  // Share link handler
  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/#post-' + post.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Load comments when drawer is opened
  useEffect(() => {
    if (!showComments) return;
    setLoadingComments(true);

    const q = query(
      collection(db, 'posts', post.id, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(msgs);
      setLoadingComments(false);
    }, (err) => {
      console.log('Error loading comments:', err.message);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [showComments, post.id]);

  // Submit comment handler
  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || submittingComment) return;

    const textToSubmit = commentText.trim();
    setCommentText('');
    setSubmittingComment(true);
    setCommentsCount(prev => prev + 1);

    try {
      const commentData = {
        text: textToSubmit,
        authorUid: currentUser.uid,
        userName: userProfile?.name || 'Creator',
        handle: userProfile?.handle || '@creator',
        userAvatar: userProfile?.avatar || '/media/HIM.jpeg',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts', post.id, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', post.id), { commentsCount: increment(1) });
    } catch (err) {
      console.error('Failed to post comment:', err);
      setCommentsCount(prev => Math.max(0, prev - 1));
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <article className="post" id={`post-${post.id}`} data-post-id={post.id}>
      <header className="post-header">
        <div className="profile-line">
          <Avatar src={post.userAvatar || post.avatar} alt={post.userName || post.user} />
          <div>
            <b>{post.userName || post.user || "Creator"}</b>
            <span>{post.handle || "@creator"} • {timeAgo(post.createdAt)}</span>
          </div>
        </div>

        <button 
          className="icon-button" 
          style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}
          type="button"
          title="More options"
        >
          <i className="fa-solid fa-ellipsis" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}></i>
        </button>
      </header>

      {/* Post Text Content */}
      {post.text && (
        <div className="post-copy" style={{ paddingTop: '2px', paddingBottom: '8px' }}>
          <p style={{ margin: 0 }}>{post.text}</p>
        </div>
      )}

      {/* Media Attachments */}
      {post.imageUrl && (
        <div className="media-frame">
          <img src={post.imageUrl} alt="Post content" loading="lazy" />
        </div>
      )}

      {post.videoUrl && (
        <div className="media-frame">
          <video src={post.videoUrl} controls preload="metadata" style={{ width: '100%' }} />
        </div>
      )}

      {/* Action Bar */}
      <div className="post-actions">
        <div className="action-group">
          <button 
            className={`like-button ${liked ? "liked" : ""}`} 
            onClick={handleToggleLike} 
            type="button" 
            title={liked ? "Unlike" : "Like"}
            aria-label="Like post"
          >
            <i className={`${liked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
          </button>
          
          <button 
            className="comment-button" 
            onClick={() => setShowComments(!showComments)} 
            type="button" 
            title={showComments ? "Hide comments" : "Show comments"}
            aria-label="Toggle comments"
          >
            <i className={`${showComments ? "fa-solid" : "fa-regular"} fa-comment`}></i>
          </button>

          <button 
            className="share-button" 
            onClick={handleShare}
            type="button" 
            title={copied ? "Link copied!" : "Share post"}
            aria-label="Share post"
          >
            <i className={copied ? "fa-solid fa-check" : "fa-regular fa-paper-plane"} style={{ color: copied ? 'var(--success)' : 'inherit' }}></i>
          </button>
        </div>

        <button 
          className={`save-button ${saved ? "saved" : ""}`} 
          onClick={handleToggleSave} 
          type="button" 
          title={saved ? "Remove bookmark" : "Save bookmark"}
          aria-label="Save post"
        >
          <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`}></i>
        </button>
      </div>

      {/* Metadata & Tags */}
      <div className="post-copy">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="meta" style={{ margin: 0 }}>
            {formatCount(likesCount)} {likesCount === 1 ? 'like' : 'likes'}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>•</span>
          <span 
            style={{ color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setShowComments(!showComments)}
          >
            {formatCount(commentsCount)} {commentsCount === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="tag-row">
            {post.tags.map((tag, idx) => (
              <span key={idx}>{tag.startsWith('#') ? tag : `#${tag}`}</span>
            ))}
          </div>
        )}
      </div>

      {/* Inline Real-Time Comments Drawer */}
      {showComments && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-soft)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {loadingComments ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          ) : comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Avatar src={c.userAvatar} size="small" />
                  <div style={{
                    flex: 1,
                    background: 'var(--surface)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <b style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{c.userName || 'Creator'}</b>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.4, color: 'var(--text)' }}>
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: '4px 0', fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center' }}>
              No comments yet. Be the first to start the conversation!
            </p>
          )}

          {/* Comment Form */}
          {currentUser && (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  opacity: (!commentText.trim() || submittingComment) ? 0.4 : 1
                }}
              >
                Reply
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
