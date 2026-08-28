import React, { useState, useRef } from 'react';
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
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const categories = ['general', 'art', 'music', 'anime'];

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setError('');
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
      setError('Write something or add media to post.');
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
    <div className="composer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="composer-modal">
        <div className="composer-modal-header">
          <h2>Create Post</h2>
          <button className="icon-button" onClick={onClose} type="button">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="compose-user">
          <img src={userProfile?.avatar || '/media/HIM.jpeg'} alt="" />
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
          rows="4"
        />

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

        {mediaPreview && (
          <div className="media-preview-container">
            {mediaFile?.type.startsWith('video/')
              ? <video src={mediaPreview} controls style={{ width: '100%', borderRadius: '12px' }} />
              : <img src={mediaPreview} alt="Preview" style={{ width: '100%', borderRadius: '12px' }} />
            }
            <button className="remove-media-btn" onClick={clearMedia} type="button">
              <i className="fa-solid fa-trash"></i>
            </button>
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
            title="Add media"
          >
            <i className="fa-regular fa-image"></i>
          </button>

          <button
            className="publish-btn"
            onClick={handlePublish}
            disabled={publishing}
            type="button"
          >
            {publishing ? <><i className="fa-solid fa-spinner fa-spin"></i> Publishing...</> : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
