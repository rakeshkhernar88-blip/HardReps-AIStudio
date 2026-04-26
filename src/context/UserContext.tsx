
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_DATA } from '../constants';

interface UserProfile {
  name: string;
  avatar: string;
  weight: number;
  height: number;
  goal: string;
  bio: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>({
    name: MOCK_DATA.user.name,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    weight: 78,
    height: 182,
    goal: 'Muscle Gain',
    bio: 'Fitness enthusiast and software engineer. Love heavy lifting and clean eating.'
  });

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
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
