import React from 'react';
import Avatar from './Avatar';
import { useFollow } from '../../hooks/useFollow';
import { useDirectMessage } from '../../hooks/useDirectMessage';

export default function UserCard({ user }) {
  const { isFollowing, toggleFollow, loading } = useFollow(user.uid, user);
  const { startChatWithUser } = useDirectMessage();

  return (
    <div className="user-card-item">
      <div className="user-card-left">
        <Avatar src={user.avatar} size="medium" />
        <div>
          <b>{user.name || 'ORION Creator'}</b>
          <span>{user.handle || '@creator'}</span>
        </div>
      </div>

      <div className="user-card-actions">
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loading}
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>

        <button
          type="button"
          onClick={() => startChatWithUser(user)}
          title="Direct Message"
          className="dm-btn"
          aria-label="Direct message creator"
        >
          <i className="fa-regular fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
