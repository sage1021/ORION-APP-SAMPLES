import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Avatar from '../components/common/Avatar';

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

    // Listener: Chat Messages | Triggers on new message | ~1 read per message
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
      ? chat.participantNames.find((_, i) => chat.participants[i] !== currentUser.uid) || 'User'
      : 'User';
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden', height: '100vh' }}>
        {/* Chat List */}
        <div style={{
          width: '320px', minWidth: '320px', borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length > 0 ? chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                type="button"
                style={{
                  width: '100%', display: 'flex', gap: '12px', alignItems: 'center',
                  padding: '15px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: activeChat?.id === chat.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: 'inherit', transition: '0.2s'
                }}
              >
                <Avatar src={null} size="small" />
                <div>
                  <b style={{ fontSize: '14px' }}>{getOtherParticipantName(chat)}</b>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>
                    {chat.lastMessage || 'Start a conversation'}
                  </p>
                </div>
              </button>
            )) : (
              <p style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center' }}>
                No conversations yet
              </p>
            )}
          </div>
        </div>

        {/* Active Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChat ? (
            <>
              <div style={{
                padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <Avatar src={null} size="small" />
                <b>{getOtherParticipantName(activeChat)}</b>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.senderUid === currentUser.uid ? 'flex-end' : 'flex-start',
                      background: msg.senderUid === currentUser.uid
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                      padding: '10px 16px', borderRadius: '16px', maxWidth: '70%',
                      fontSize: '14px', lineHeight: 1.5
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} style={{
                padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', gap: '10px'
              }}>
                <input
                  type="text" value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: '14px', outline: 'none'
                  }}
                />
                <button type="submit" disabled={sending} style={{
                  padding: '12px 20px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                  fontWeight: 600, cursor: 'pointer'
                }}>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '15px', color: 'rgba(255,255,255,0.3)'
            }}>
              <i className="fa-regular fa-paper-plane" style={{ fontSize: '48px' }}></i>
              <p style={{ fontSize: '16px' }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
