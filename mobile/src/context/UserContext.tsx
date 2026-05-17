import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
  profilePic: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateProfilePic: (uri: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateProfilePic = (uri: string) => {
    if (user) {
      setUser({ ...user, profilePic: uri });
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
