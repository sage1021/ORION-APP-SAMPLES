import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile document from Firestore
  async function syncUserProfile(user) {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        // Create initial profile doc if missing
        const newProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'ORION Creator',
          handle: `@${(user.displayName || user.email?.split('@')[0] || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          email: user.email,
          avatar: user.photoURL || '/media/HIM.jpeg',
          bio: 'Digital creator on ORION Social.',
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching/creating user profile:", err);
    }
  }

  // Session Hydration Listener
  useEffect(() => {
    // Listener: Auth State | Triggers on login/logout/reload | ~1 read per auth change
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false); // Hydration complete
    });

    return () => unsubscribe();
  }, []);

  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
      const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`;
      const profile = {
        uid: cred.user.uid,
        name: displayName,
        handle: handle,
        email: email,
        avatar: '/media/HIM.jpeg',
        bio: 'Digital creator on ORION Social.',
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setUserProfile(profile);
      return cred;
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    return signOut(auth);
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshProfile: () => syncUserProfile(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
