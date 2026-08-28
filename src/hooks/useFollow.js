import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, updateDoc, increment, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useFollow(targetUid, targetUserData) {
  const { currentUser, userProfile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !targetUid || currentUser.uid === targetUid) {
      setLoading(false);
      return;
    }

    const followRef = doc(db, 'users', currentUser.uid, 'following', targetUid);
    const unsubscribe = onSnapshot(followRef, (docSnap) => {
      setIsFollowing(docSnap.exists());
      setLoading(false);
    }, (err) => {
      console.error('Error listening to follow status:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, targetUid]);

  async function toggleFollow() {
    if (!currentUser || !targetUid || currentUser.uid === targetUid || loading) return;
    setLoading(true);

    try {
      const myFollowingRef = doc(db, 'users', currentUser.uid, 'following', targetUid);
      const targetFollowerRef = doc(db, 'users', targetUid, 'followers', currentUser.uid);
      const myUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUid);

      if (isFollowing) {
        // Unfollow logic
        await deleteDoc(myFollowingRef);
        await deleteDoc(targetFollowerRef);
        await updateDoc(myUserRef, { followingCount: increment(-1) }).catch(() => {});
        await updateDoc(targetUserRef, { followersCount: increment(-1) }).catch(() => {});
      } else {
        // Follow logic
        await setDoc(myFollowingRef, {
          uid: targetUid,
          name: targetUserData?.name || 'Creator',
          handle: targetUserData?.handle || '@creator',
          avatar: targetUserData?.avatar || '/media/HIM.jpeg',
          followedAt: serverTimestamp()
        });

        await setDoc(targetFollowerRef, {
          uid: currentUser.uid,
          name: userProfile?.name || 'Creator',
          handle: userProfile?.handle || '@creator',
          avatar: userProfile?.avatar || '/media/HIM.jpeg',
          followedAt: serverTimestamp()
        });

        await updateDoc(myUserRef, { followingCount: increment(1) }).catch(() => {});
        await updateDoc(targetUserRef, { followersCount: increment(1) }).catch(() => {});

        // Send Notification to Target User
        await addDoc(collection(db, 'users', targetUid, 'notifications'), {
          type: 'follow',
          userName: userProfile?.name || 'Creator',
          userHandle: userProfile?.handle || '@creator',
          userAvatar: userProfile?.avatar || '/media/HIM.jpeg',
          targetText: 'started following you.',
          read: false,
          createdAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setLoading(false);
    }
  }

  return { isFollowing, toggleFollow, loading };
}
