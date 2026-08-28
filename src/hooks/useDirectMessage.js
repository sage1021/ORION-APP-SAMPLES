import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useDirectMessage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  async function startChatWithUser(targetUser) {
    if (!currentUser || !targetUser?.uid || currentUser.uid === targetUser.uid) return;

    try {
      // Check if chat already exists
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      let existingChat = null;

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(targetUser.uid)) {
          existingChat = { id: docSnap.id, ...data };
        }
      });

      if (existingChat) {
        navigate('/chat', { state: { selectedChatId: existingChat.id } });
        return;
      }

      // Create new chat document
      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.uid, targetUser.uid],
        participantNames: [userProfile?.name || 'User', targetUser.name || 'User'],
        participantAvatars: [userProfile?.avatar || '/media/HIM.jpeg', targetUser.avatar || '/media/HIM.jpeg'],
        lastMessage: 'Chat started',
        updatedAt: serverTimestamp()
      });

      navigate('/chat', { state: { selectedChatId: newChatRef.id } });
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  }

  return { startChatWithUser };
}
