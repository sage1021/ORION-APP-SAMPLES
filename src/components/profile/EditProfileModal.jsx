import React, { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

export default function EditProfileModal({ isOpen, onClose }) {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Initialize fields from current profile
  useEffect(() => {
    if (userProfile && isOpen) {
      setName(userProfile.name || '');
      setHandle((userProfile.handle || '').replace(/^@/, ''));
      setBio(userProfile.bio || '');
      setAvatarPreview(userProfile.avatar || '');
      setAvatarFile(null);
      setError('');
    }
  }, [userProfile, isOpen]);

  // Handle ESC key to dismiss
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
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!currentUser) return;

    setSaving(true);
    setError('');

    try {
      let finalAvatarUrl = userProfile?.avatar || '/media/HIM.jpeg';

      if (avatarFile) {
        finalAvatarUrl = await uploadToCloudinary(avatarFile);
      }

      const formattedHandle = handle.trim()
        ? `@${handle.trim().replace(/^@/, '').toLowerCase().replace(/\s+/g, '')}`
        : userProfile?.handle || '@creator';

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        handle: formattedHandle,
        bio: bio.trim(),
        avatar: finalAvatarUrl
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="composer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="composer-modal" style={{ maxWidth: '460px' }}>
        <div className="composer-modal-header">
          <h2>Edit Profile</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar Upload Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              <Avatar src={avatarPreview} size="large" />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#ffffff', fontSize: '1.1rem',
                backdropFilter: 'blur(2px)', transition: 'opacity 0.2s ease'
              }} title="Change avatar">
                <i className="fa-solid fa-camera"></i>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'transparent', border: 'none', color: 'var(--primary)',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Change Photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'var(--surface-soft)',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>

          {/* Handle Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Username Handle
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 700 }}>@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="handle"
                maxLength={30}
                style={{
                  width: '100%', padding: '10px 14px 10px 28px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', background: 'var(--surface-soft)',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Bio Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Bio
              </label>
              <span style={{ fontSize: '0.75rem', color: bio.length > 140 ? 'var(--danger)' : 'var(--muted)' }}>
                {bio.length}/160
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the ORION community about yourself..."
              maxLength={160}
              rows="3"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'var(--surface-soft)',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          {error && <p className="composer-error">{error}</p>}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '9px 18px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)', background: 'var(--surface-soft)',
                color: 'var(--text)', fontWeight: 600, fontSize: '0.86rem', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="publish-btn"
            >
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
