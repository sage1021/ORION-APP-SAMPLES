import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useDirectMessage } from '../hooks/useDirectMessage';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Avatar from '../components/common/Avatar';
import MobileNav from '../components/layout/MobileNav';

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const { startChatWithUser } = useDirectMessage();
  const location = useLocation();
  const selectedChatId = location.state?.selectedChatId;

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // New Chat Modal State
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const messagesEndRef = useRef(null);

  // Load user's chats
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Auto-select chat if passed via navigation
  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const match = chats.find(c => c.id === selectedChatId);
      if (match) setActiveChat(match);
    }
  }, [selectedChatId, chats]);

  // Load all users when New Chat modal is opened
  useEffect(() => {
    if (!newChatModalOpen) return;
    setLoadingUsers(true);

    const q = query(collection(db, 'users'));
    getDocs(q).then((snapshot) => {
      const list = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser?.uid);
      setAllUsers(list);
      setLoadingUsers(false);
    }).catch((err) => {
      console.error("Failed to load users:", err);
      setLoadingUsers(false);
    });
  }, [newChatModalOpen, currentUser]);

  // Load messages for active chat
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }

    const q = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [activeChat]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;
    setSending(true);

    try {
      const text = newMessage.trim();
      setNewMessage('');

      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        text,
        senderUid: currentUser.uid,
        senderName: userProfile?.name || 'User',
        senderAvatar: userProfile?.avatar || '/media/HIM.jpeg',
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setSending(false);
    }
  }

  function getOtherParticipantName(chat) {
    return chat.participantNames
      ? chat.participantNames.find((_, i) => chat.participants[i] !== currentUser.uid) || 'Creator'
      : 'Creator';
  }

  const filteredUsers = allUsers.filter(u =>
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.handle || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="app-shell" style={{ gridTemplateColumns: '248px minmax(0, 1fr)' }}>
      <Navbar />
      
      <main className="content">
        <Topbar title="Messages" subtitle="Real-time encrypted direct messaging" />

        <div className="chat-layout" style={{ marginTop: '12px' }}>
          {/* Chat List Sidebar */}
          <div className="chat-list">
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Conversations</h2>
              <button
                onClick={() => setNewChatModalOpen(true)}
                className="icon-button"
                style={{ width: '32px', height: '32px', border: 'none', background: 'var(--primary-soft)', color: 'var(--primary)' }}
                title="Start new conversation"
                type="button"
                aria-label="New conversation"
              >
                <i className="fa-solid fa-pen-to-square" style={{ fontSize: '0.9rem' }}></i>
              </button>
            </div>
            
            <div>
              {chats.length > 0 ? chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`chat-list-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                >
                  <Avatar src={null} size="small" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getOtherParticipantName(chat)}
                    </b>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage || 'Direct message thread'}
                    </p>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '32px 16px', color: 'var(--muted)', fontSize: '0.86rem', textAlign: 'center' }}>
                  <i className="fa-regular fa-comments" style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px', color: 'var(--primary)' }}></i>
                  No conversations yet.<br />
                  <button
                    onClick={() => setNewChatModalOpen(true)}
                    type="button"
                    style={{
                      marginTop: '10px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Start a Chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Chat Thread */}
          <div className="chat-thread">
            {activeChat ? (
              <>
                <div style={{
                  padding: '12px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-soft)'
                }}>
                  <Avatar src={null} size="small" />
                  <div>
                    <b style={{ fontSize: '0.94rem', color: 'var(--text)' }}>{getOtherParticipantName(activeChat)}</b>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--success)' }}>● Active Now</span>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.map(msg => {
                    const isMine = msg.senderUid === currentUser.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}
                      >
                        {msg.text}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-bar">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    aria-label="Message text"
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()} aria-label="Send message">
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </form>
              </>
            ) : (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '12px', color: 'var(--muted)', padding: '24px', textAlign: 'center'
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--surface-soft)', display: 'grid', placeItems: 'center',
                  fontSize: '1.4rem', color: 'var(--primary)'
                }}>
                  <i className="fa-regular fa-paper-plane"></i>
                </div>
                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.05rem', fontWeight: 700 }}>Select a Conversation</h3>
                <p style={{ margin: 0, fontSize: '0.86rem', maxWidth: '300px' }}>
                  Choose an existing conversation or start a new chat with creators on ORION.
                </p>
                <button
                  onClick={() => setNewChatModalOpen(true)}
                  type="button"
                  style={{
                    marginTop: '4px',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Start New Message
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Conversation User Picker Modal */}
      {newChatModalOpen && (
        <div
          className="composer-overlay"
          onClick={(e) => e.target === e.currentTarget && setNewChatModalOpen(false)}
        >
          <div className="composer-modal" style={{ maxWidth: '440px' }}>
            <div className="composer-modal-header">
              <h2>New Message</h2>
              <button
                className="icon-button"
                onClick={() => setNewChatModalOpen(false)}
                type="button"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* User Search Input */}
            <div className="search" style={{ minHeight: '38px', padding: '0 12px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '0.82rem' }}></i>
              <input
                type="search"
                placeholder="Search creators by name or @handle..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Users List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loadingUsers ? (
                <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                  Loading creators...
                </p>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div
                    key={user.uid}
                    onClick={() => {
                      setNewChatModalOpen(false);
                      startChatWithUser(user);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                      borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background 0.15s ease',
                      background: 'var(--surface-soft)'
                    }}
                  >
                    <Avatar src={user.avatar} size="small" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name || 'Creator'}
                      </b>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {user.handle || '@creator'}
                      </span>
                    </div>
                    <i className="fa-regular fa-paper-plane" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}></i>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                  {userSearch ? `No creators match "${userSearch}"` : 'No other creators registered yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
