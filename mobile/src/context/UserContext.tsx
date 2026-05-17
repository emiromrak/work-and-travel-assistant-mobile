import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
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

  // Galeriden seçilen fotoğrafı base64'e çevirir ve backend'e kaydeder
  const updateProfilePic = async (uri: string) => {
    if (!user) return;

    // 1. URI'yi base64 string'e çevir
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Ekranda hemen göstermek için local state'i güncelle (URI)
    setUser({ ...user, profilePic: uri });

    // 3. Backend'e base64 olarak gönder (arka planda)
    try {
      await updateProfilePicAPI(user.id, `data:image/jpeg;base64,${base64}`);
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
