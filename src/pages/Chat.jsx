import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Avatar from '../components/common/Avatar';
import MobileNav from '../components/layout/MobileNav';

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const selectedChatId = location.state?.selectedChatId;

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
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
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        text: newMessage.trim(),
        senderUid: currentUser.uid,
        senderName: userProfile?.name || 'User',
        senderAvatar: userProfile?.avatar || '/media/HIM.jpeg',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
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

  return (
    <div className="app-shell" style={{ gridTemplateColumns: '248px minmax(0, 1fr)' }}>
      <Navbar />
      
      <main className="content">
        <Topbar title="Messages" subtitle="Real-time encrypted direct messaging" />

        <div className="chat-layout" style={{ marginTop: '12px' }}>
          {/* Chat List Sidebar */}
          <div className="chat-list">
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Conversations</h2>
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
                <p style={{ padding: '24px 16px', color: 'var(--muted)', fontSize: '0.86rem', textAlign: 'center', margin: 0 }}>
                  No conversations yet.<br />Message creators from the feed!
                </p>
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
                  <button type="submit" disabled={sending} aria-label="Send message">
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
                <p style={{ margin: 0, fontSize: '0.86rem', maxWidth: '280px' }}>
                  Choose an existing conversation or start a new chat with creators on ORION.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
