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

  // Optimistic Like Handler
  async function handleToggleLike() {
    if (!currentUser || isLiking) return;
    setIsLiking(true);

    const prevLiked = liked;
    const prevCount = likesCount;

    // 1. Optimistic Update
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
      // Revert on error
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

  return (
    <article className="post" data-post-id={post.id}>
      <div className="post-header">
        <div className="profile-line">
          <Avatar src={post.userAvatar || post.avatar} alt={post.userName || post.user} />
          <div>
            <b>{post.userName || post.user || "Creator"}</b>
            <span>{post.handle || "@user"} - {timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {post.imageUrl && (
        <div className="media-frame">
          <img src={post.imageUrl} alt="Post content" loading="lazy" />
        </div>
      )}

      {post.videoUrl && (
        <div className="media-frame">
          <video src={post.videoUrl} controls preload="metadata" style={{ width: '100%', borderRadius: '12px' }} />
        </div>
      )}

      <div className="post-actions">
        <div className="action-group">
          <button 
            className={`like-button ${liked ? "liked" : ""}`} 
            onClick={handleToggleLike} 
            type="button" 
            title="Like"
          >
            <i className={`${liked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
          </button>
          <button 
            className="comment-button" 
            onClick={() => onOpenComments && onOpenComments(post.id)} 
            type="button" 
            title="Comment"
          >
            <i className="fa-regular fa-comment"></i>
          </button>
          <button className="share-button" type="button" title="Share">
            <i className="fa-regular fa-paper-plane"></i>
          </button>
        </div>
        <button 
          className={`save-button ${saved ? "saved" : ""}`} 
          onClick={handleToggleSave} 
          type="button" 
          title="Save"
        >
          <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`}></i>
        </button>
      </div>

      <div className="post-copy">
        <b className="meta">
          {formatCount(likesCount)} likes - {formatCount(post.commentsCount || 0)} comments
        </b>
        <p>
          <b>{post.userName || post.user}</b> {post.text}
        </p>
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
