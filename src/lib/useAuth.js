import { useState, useEffect } from 'react';


export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const userDoc = await db.collection('users').doc(authUser.email).get();
        setRole(userDoc.data().role);
        setUser(authUser);
      } else {
        setUser(null);
        setRole('');
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, role };
};
