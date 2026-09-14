import React, { useState, useRef, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useAuth } from '../../hooks/useAuth';

export default function ComposerModal({ isOpen, onClose }) {
  const { currentUser, userProfile } = useAuth();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const categories = ['general', 'art', 'music', 'anime', 'dev'];

  // Handle ESC key to dismiss modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setError('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please upload an image (JPG, PNG, WebP) or video (MP4, WebM).');
    }
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function extractTags(str) {
    const matches = str.match(/#\w+/g);
    return matches ? matches.map(t => t.toLowerCase()) : [];
  }

  async function handlePublish() {
    if (!text.trim() && !mediaFile) {
      setError('Write something or add media to publish.');
      return;
    }
    setPublishing(true);
    setError('');

    try {
      let imageUrl = '';
      let videoUrl = '';

      if (mediaFile) {
        const url = await uploadToCloudinary(mediaFile);
        if (mediaFile.type.startsWith('video/')) {
          videoUrl = url;
        } else {
          imageUrl = url;
        }
      }

      await addDoc(collection(db, 'posts'), {
        text: text.trim(),
        imageUrl,
        videoUrl,
        category,
        tags: extractTags(text),
        authorUid: currentUser.uid,
        userName: userProfile?.name || 'Creator',
        handle: userProfile?.handle || '@creator',
        userAvatar: userProfile?.avatar || '/media/HIM.jpeg',
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });

      setText('');
      setCategory('general');
      clearMedia();
      onClose();
    } catch (err) {
      console.error('Publish failed:', err);
      setError(err.message || 'Failed to publish post.');
    } finally {
      setPublishing(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="composer-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="composer-modal" style={{ border: isDragging ? '2px dashed var(--primary)' : '1px solid var(--border)' }}>
        <div className="composer-modal-header">
          <h2>Create Post</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close composer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="compose-user">
          <img src={userProfile?.avatar || '/media/HIM.jpeg'} alt={userProfile?.name || 'Creator'} />
          <div>
            <b>{userProfile?.name || 'Creator'}</b>
            <span>{userProfile?.handle || '@creator'}</span>
          </div>
        </div>

        <textarea
          id="postText"
          placeholder="What's happening in your orbit?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows="4"
          autoFocus
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Category Selectors */}
          <div className="composer-categories">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={category === cat ? 'active' : ''}
                onClick={() => setCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Character Counter */}
          <span style={{ fontSize: '0.75rem', color: text.length > 450 ? 'var(--danger)' : 'var(--muted)', fontWeight: 600 }}>
            {text.length}/500
          </span>
        </div>

        {/* Media Preview or Dropzone hint */}
        {mediaPreview ? (
          <div className="media-preview-container">
            {mediaFile?.type.startsWith('video/')
              ? <video src={mediaPreview} controls style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
              : <img src={mediaPreview} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
            }
            <button className="remove-media-btn" onClick={clearMedia} type="button" title="Remove media">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        ) : isDragging && (
          <div style={{
            padding: '24px',
            border: '2px dashed var(--primary)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            color: 'var(--primary)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <i className="fa-solid fa-arrow-down" style={{ display: 'block', fontSize: '1.4rem', marginBottom: '6px' }}></i>
            Drop your image or video here
          </div>
        )}

        {error && <p className="composer-error">{error}</p>}

        <div className="composer-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="mediaUploadInput"
          />
          
          <button
            type="button"
            className="icon-button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image or video"
            aria-label="Upload media"
          >
            <i className="fa-regular fa-image"></i>
          </button>

          <button
            className="publish-btn"
            onClick={handlePublish}
            disabled={publishing || (!text.trim() && !mediaFile)}
            type="button"
          >
            {publishing ? <><i className="fa-solid fa-spinner fa-spin"></i> Publishing...</> : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
