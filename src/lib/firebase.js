import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD0e21P_9lIin0GB1VGdUHAN4ZrkeEMxPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "orion--project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "orion--project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "orion--project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "91554323371",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:91554323371:web:5b5ba0c66b6d767ed6d0ee"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
