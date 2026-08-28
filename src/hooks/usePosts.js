import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function usePosts(categoryFilter = 'all') {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (categoryFilter && categoryFilter !== 'all') {
      q = query(
        collection(db, 'posts'),
        where('category', '==', categoryFilter),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    }

    // Listener: Posts Feed | Triggers on post create/update/delete | ~1-5 reads per change
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryFilter]);

  return { posts, loading };
}
