import React from 'react';
import Avatar from './Avatar';
import { useFollow } from '../../hooks/useFollow';
import { useDirectMessage } from '../../hooks/useDirectMessage';

export default function UserCard({ user }) {
  const { isFollowing, toggleFollow, loading } = useFollow(user.uid, user);
  const { startChatWithUser } = useDirectMessage();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
      background: 'var(--surface-soft)', border: '1px solid var(--border)',
      borderRadius: '10px', marginBottom: '8px'
    }}>
      <Avatar src={user.avatar} size="medium" />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: '14px', display: 'block', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name || 'ORION Creator'}
        </b>
        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
          {user.handle || '@creator'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loading}
          style={{
            padding: '6px 14px', borderRadius: '16px',
            border: isFollowing ? '1px solid var(--border)' : 'none',
            background: isFollowing ? 'var(--surface)' : 'var(--primary)',
            color: isFollowing ? 'var(--text)' : '#fff',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.15s'
          }}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>

        <button
          type="button"
          onClick={() => startChatWithUser(user)}
          title="Message user"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '13px'
          }}
        >
          <i className="fa-regular fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
