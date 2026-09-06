import React, { useState } from 'react';
import { doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

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

export default function PostCard({ post, onOpenComments }) {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes || 0);
  const [saved, setSaved] = useState(post.isSavedByCurrentUser || false);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

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
            onClick={() => onOpenComments && onOpenComments(post.id)} 
            type="button" 
            title="Comment"
            aria-label="Comment on post"
          >
            <i className="fa-regular fa-comment"></i>
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
            onClick={() => onOpenComments && onOpenComments(post.id)}
          >
            {formatCount(post.commentsCount || 0)} {post.commentsCount === 1 ? 'comment' : 'comments'}
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
    </article>
  );
}
