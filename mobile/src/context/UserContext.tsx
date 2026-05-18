import React, { createContext, useState, useContext, ReactNode } from 'react';
import { updateProfilePicAPI } from '../services/api';

interface User {
  id: number;        // ← backend'deki user_id
  username: string;
  email: string;
  profilePic: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateProfilePic: (uri: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateProfilePic = async (uri: string) => {
    if (!user) return;

    // 1. Ekranda hemen göstermek için local URI ile state'i güncelle
    setUser({ ...user, profilePic: uri });

    // 2. Backend'e FormData olarak gönder
    try {
      const result = await updateProfilePicAPI(user.id, uri);
      // Backend'den dönen kalıcı base64 URL ile state'i güncelle
      if (result?.profile_pic) {
        setUser((prev) => prev ? { ...prev, profilePic: result.profile_pic } : prev);
      }
    } catch (error) {
      console.error('Backend profil fotoğrafı kaydedilemedi:', error);
      // Hata olsa bile local görünüm korunur
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
