
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_DATA } from '../constants';

interface GlobalReminder {
  id: string;
  type: 'water' | 'protein' | 'sleep' | 'meal' | 'move' | 'custom';
  time: string;
  enabled: boolean;
  message: string;
  days: string[];
}

interface UserProfile {
  name: string;
  avatar: string;
  weight: number;
  height: number;
  goal: string;
  bio: string;
  assistantName: string;
  assistantStyle: string;
  assistantMessages: {
    confirmation: string;
    automatic: string;
    workout_time: string;
  };
  personalBests: {
    bench: number;
    squat: number;
    deadlift: number;
    overhead: number;
  };
  unit: 'kg' | 'lbs';
  isPublic: boolean;
  level: number;
  xp: number;
  totalXp: number;
  points: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
    requirement: string;
  }>;
  reminders: GlobalReminder[];
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<GlobalReminder>) => void;
  addReminder: (reminder: Omit<GlobalReminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>({
    name: MOCK_DATA.user.name,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    weight: 78,
    height: 182,
    goal: 'Muscle Gain',
    bio: 'Fitness enthusiast and software engineer. Love heavy lifting and clean eating.',
    assistantName: 'Bunny',
    assistantStyle: 'friendly',
    assistantMessages: {
      confirmation: 'Assistant puchega — ready ho?',
      automatic: 'Naya reminder kab chahiye?',
      workout_time: 'Workout start karne ka waqt aa gaya hai!',
    },
    personalBests: {
      bench: 100,
      squat: 140,
      deadlift: 180,
      overhead: 60,
    },
    unit: 'kg',
    isPublic: true,
    level: 12,
    xp: 450,
    totalXp: 12450,
    points: 1250,
    badges: [
      { id: 'b1', name: 'Early Bird', icon: '🌅', unlocked: true, requirement: 'Wake up at 5 AM' },
      { id: 'b2', name: 'Iron King', icon: '🏋️', unlocked: true, requirement: 'Total lift 500kg' },
      { id: 'b3', name: 'Consistent', icon: '🔥', unlocked: true, requirement: '7 day streak' },
      { id: 'b4', name: 'Water God', icon: '💧', unlocked: false, requirement: 'Drink 4L water for 5 days' },
      { id: 'b5', name: 'Marathoner', icon: '🏃', unlocked: false, requirement: 'Run 10km in one go' },
    ],
    reminders: [
      { id: 'rem-1', type: 'water', time: '10:00 AM', enabled: true, message: 'Paani pee lo! Hydration is key 💧', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      { id: 'rem-2', type: 'move', time: '02:00 PM', enabled: true, message: 'Thoda walk karlo, break time! 🚶‍♂️', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      { id: 'rem-3', type: 'sleep', time: '10:00 PM', enabled: true, message: 'Phone band! Time to recover 😴', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    ]
  });

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const toggleReminder = (id: string) => {
    setUser(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    }));
  };

  const updateReminder = (id: string, updates: Partial<GlobalReminder>) => {
    setUser(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const addReminder = (reminder: Omit<GlobalReminder, 'id'>) => {
    setUser(prev => ({
      ...prev,
      reminders: [...prev.reminders, { ...reminder, id: `rem-${Date.now()}` }]
    }));
  };

  const deleteReminder = (id: string) => {
    setUser(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, toggleReminder, updateReminder, addReminder, deleteReminder }}>
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
