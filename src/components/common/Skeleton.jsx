import React from 'react';

export function PostSkeleton() {
  return (
    <article className="skeleton-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton skeleton-avatar" style={{ width: '40px', height: '40px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div className="skeleton" style={{ width: '35%', height: '14px' }}></div>
          <div className="skeleton" style={{ width: '20%', height: '11px' }}></div>
        </div>
      </div>
      <div className="skeleton" style={{ width: '90%', height: '14px', marginTop: '4px' }}></div>
      <div className="skeleton" style={{ width: '70%', height: '14px' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: '12px', marginTop: '6px' }}></div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <div className="skeleton skeleton-avatar" style={{ width: '32px', height: '32px' }}></div>
        <div className="skeleton skeleton-avatar" style={{ width: '32px', height: '32px' }}></div>
        <div className="skeleton skeleton-avatar" style={{ width: '32px', height: '32px' }}></div>
      </div>
    </article>
  );
}

export function UserCardSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div className="skeleton skeleton-avatar" style={{ width: '38px', height: '38px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div className="skeleton" style={{ width: '40%', height: '13px' }}></div>
          <div className="skeleton" style={{ width: '25%', height: '10px' }}></div>
        </div>
      </div>
      <div className="skeleton" style={{ width: '60px', height: '26px', borderRadius: '9999px' }}></div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0' }}>
      <div className="skeleton skeleton-avatar" style={{ width: '30px', height: '30px' }}></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div className="skeleton" style={{ width: '30%', height: '12px' }}></div>
        <div className="skeleton" style={{ width: '85%', height: '12px' }}></div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton skeleton-avatar" style={{ width: '42px', height: '42px' }}></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="skeleton" style={{ width: '55%', height: '14px' }}></div>
        <div className="skeleton" style={{ width: '25%', height: '11px' }}></div>
      </div>
      <div className="skeleton" style={{ width: '42px', height: '42px', borderRadius: '8px' }}></div>
    </div>
  );
}
