import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import Avatar from '../components/common/Avatar';

export default function Activity() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchVal, setSearchVal] = useState('');
  const [followedMap, setFollowedMap] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActivities(notifs);
      } else {
        setActivities([]);
      }
    }, (err) => {
      console.log('No activity notifications found:', err.message);
      setActivities([]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredActivities = activities.filter(act => {
    if (activeTab !== 'all' && act.type !== activeTab) return false;
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase();
      return (
        act.userName?.toLowerCase().includes(q) ||
        act.targetText?.toLowerCase().includes(q) ||
        act.userHandle?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = activities.filter(a => !a.read).length;

  function markAllAsRead() {
    setActivities(prev => prev.map(a => ({ ...a, read: true })));
    if (currentUser) {
      activities.forEach(a => {
        if (!a.id.startsWith('act-')) {
          updateDoc(doc(db, 'users', currentUser.uid, 'notifications', a.id), { read: true }).catch(() => {});
        }
      });
    }
  }

  function toggleFollowBack(id) {
    setFollowedMap(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function getActivityIcon(type) {
    switch (type) {
      case 'like':
        return <i className="fa-solid fa-heart" style={{ color: '#ef4444' }}></i>;
      case 'comment':
        return <i className="fa-solid fa-comment-dots" style={{ color: '#6366f1' }}></i>;
      case 'follow':
        return <i className="fa-solid fa-user-plus" style={{ color: '#10b981' }}></i>;
      case 'mention':
        return <i className="fa-solid fa-at" style={{ color: '#deb887' }}></i>;
      default:
        return <i className="fa-solid fa-bell" style={{ color: 'var(--primary)' }}></i>;
    }
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="content">
        <Topbar
          title="Activity"
          subtitle="Notifications & updates"
          searchVal={searchVal}
          onSearchChange={setSearchVal}
        />

        {/* Action Header & Tabs */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px', margin: '20px 0 16px'
        }}>
          <div className="tabs" role="tablist">
            {[
              { id: 'all', label: 'All' },
              { id: 'like', label: 'Likes' },
              { id: 'comment', label: 'Comments' },
              { id: 'follow', label: 'Follows' },
              { id: 'mention', label: 'Mentions' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              type="button"
              style={{
                background: 'rgba(222, 184, 135, 0.15)', border: '1px solid rgba(222, 184, 135, 0.4)',
                color: 'var(--primary)', padding: '6px 14px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-check-double" style={{ marginRight: '6px' }}></i>
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Activity List Container */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow)'
        }}>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act, index) => {
              const isFollowing = !!followedMap[act.id];

              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: index !== filteredActivities.length - 1 ? '1px solid var(--border)' : 'none',
                    background: act.read ? 'transparent' : 'rgba(222, 184, 135, 0.06)',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {/* Avatar with Type Icon Badge */}
                  <div style={{ position: 'relative' }}>
                    <Avatar src={act.userAvatar} size="medium" />
                    <div style={{
                      position: 'absolute', bottom: '-4px', right: '-4px',
                      background: 'var(--surface)', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {getActivityIcon(act.type)}
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4 }}>
                      <b style={{ color: 'var(--text)' }}>{act.userName} </b>
                      <span style={{ color: 'var(--muted)' }}>{act.targetText}</span>
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                      {act.time}
                    </span>
                  </div>

                  {/* Interaction Button or Media Preview */}
                  {act.type === 'follow' ? (
                    <button
                      onClick={() => toggleFollowBack(act.id)}
                      type="button"
                      style={{
                        padding: '6px 14px', borderRadius: '8px',
                        border: isFollowing ? '1px solid var(--border)' : 'none',
                        background: isFollowing ? 'var(--surface-soft)' : 'var(--primary)',
                        color: isFollowing ? 'var(--text)' : '#fff',
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow Back'}
                    </button>
                  ) : act.mediaPreview ? (
                    <img
                      src={act.mediaPreview}
                      alt="Thumbnail"
                      style={{
                        width: '44px', height: '44px', borderRadius: '8px',
                        objectFit: 'cover', border: '1px solid var(--border)'
                      }}
                    />
                  ) : null}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <i className="fa-regular fa-bell-slash" style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }}></i>
              <b>No notifications to display</b>
              <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
                {searchVal ? 'No activity matches your search filter.' : 'When someone interacts with your posts, you will see it here.'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Sidebar />
    </div>
  );
}
