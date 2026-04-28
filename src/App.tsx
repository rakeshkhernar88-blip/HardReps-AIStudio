/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Dumbbell, 
  BarChart2, 
  LayoutGrid, 
  MessageSquare, 
  Activity, 
  Moon, 
  BookText,
  History,
  UserCircle
} from 'lucide-react';
import { MOCK_DATA, COLORS } from './constants';
import { WorkoutSession } from './components/WorkoutSessionCard';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { UserProvider, useUser } from './context/UserContext';
import NotificationCenter from './components/NotificationCenter';
import { feedback } from './lib/haptics';

// Tabs
import HomeTab from './components/tabs/HomeTab';
import TrainTab from './components/tabs/TrainTab';
import StatsTab from './components/tabs/StatsTab';
import BoardTab from './components/tabs/BoardTab';
import AICoachTab from './components/tabs/AICoachTab';
import BodyPredictorTab from './components/tabs/BodyPredictorTab';
import SleepTab from './components/tabs/SleepTab';
import JournalTab from './components/tabs/JournalTab';
import HistoryTab from './components/tabs/HistoryTab';
import ProfileTab from './components/tabs/ProfileTab';
import HubTab from './components/tabs/HubTab';
import RemindersTab from './components/tabs/RemindersTab';
import HeartRateTab from './components/tabs/HeartRateTab';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, component: HomeTab },
  { id: 'train', label: 'Train', icon: Dumbbell, component: TrainTab },
  { id: 'ai', label: 'Coach', icon: MessageSquare, component: AICoachTab },
  { id: 'stats', label: 'Stats', icon: BarChart2, component: StatsTab },
  { id: 'hub', label: 'Hub', icon: LayoutGrid, component: HubTab },
  { id: 'reminders', label: 'Reminders', icon: MessageSquare, component: RemindersTab },
  { id: 'history', label: 'History', icon: History, component: HistoryTab },
  { id: 'board', label: 'Board', icon: LayoutGrid, component: BoardTab },
  { id: 'body', label: 'Body', icon: Activity, component: BodyPredictorTab },
  { id: 'sleep', label: 'Sleep', icon: Moon, component: SleepTab },
  { id: 'journal', label: 'Journal', icon: BookText, component: JournalTab },
  { id: 'profile', label: 'Profile', icon: UserCircle, component: ProfileTab },
];

const NotificationInitializer = () => {
  const { addNotification } = useNotifications();
  const { user } = useUser();
  
  useEffect(() => {
    // Check if we've already shown the welcome message this session
    const shown = sessionStorage.getItem('welcome_shown');
    if (!shown) {
      setTimeout(() => {
        addNotification(`Coach is Ready, ${user.name}! 🤖`, 'I will send you tips and reminders here as you train. Get after it!', 'success');
        sessionStorage.setItem('welcome_shown', 'true');
      }, 2000);
    }
  }, [addNotification, user.name]);
  
  return null;
};

function AppContent() {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState<WorkoutSession[]>(MOCK_DATA.workoutHistory as WorkoutSession[]);

  useEffect(() => {
    const handleNavigation = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('navigate-tab', handleNavigation);
    return () => window.removeEventListener('navigate-tab', handleNavigation);
  }, []);

  const addWorkoutToHistory = (workout: WorkoutSession) => {
    setHistory(prev => [workout, ...prev]);
    setActiveTab('history');
  };

  // Main navigation tabs
  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'train', label: 'Train', icon: Dumbbell },
    { id: 'ai', label: 'Coach', icon: MessageSquare },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'hub', label: 'Hub', icon: LayoutGrid },
  ];

  const showStatusSummary = () => {
    feedback();
    addNotification(
      'Current Status',
      `${user.name}, your recovery score is 84%. Today is a good day for high-intensity training!`,
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex justify-center selection:bg-[#6C63FF]/30">
      <div className="w-full max-w-[390px] min-h-screen bg-[#0a0a0a] relative flex flex-col pb-52 shadow-2xl">
        <header className="px-6 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={showStatusSummary}
              className="text-2xl font-bold tracking-tight text-white active:scale-95 transition-transform"
            >
              HardReps
            </button>
            <div className="flex items-center space-x-3">
              <NotificationCenter />
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-10 h-10 rounded-full border overflow-hidden transition-all duration-300 ${
                  activeTab === 'profile' ? 'border-[#6C63FF] ring-2 ring-[#6C63FF]/20 scale-105' : 'border-white/10'
                }`}
              >
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'hub' ? (
                <HubTab onNavigate={setActiveTab} />
              ) : activeTab === 'reminders' ? (
                <RemindersTab onBack={() => setActiveTab('hub')} />
              ) : activeTab === 'history' ? (
                <HistoryTab history={history} />
              ) : activeTab === 'train' ? (
                <TrainTab onFinish={addWorkoutToHistory} />
              ) : activeTab === 'home' ? (
                <HomeTab />
              ) : activeTab === 'stats' ? (
                <StatsTab />
              ) : activeTab === 'board' ? (
                <BoardTab fitData={MOCK_DATA.stats} />
              ) : activeTab === 'ai' ? (
                <AICoachTab />
              ) : activeTab === 'body' ? (
                <BodyPredictorTab />
              ) : activeTab === 'sleep' ? (
                <SleepTab />
              ) : activeTab === 'journal' ? (
                <JournalTab />
              ) : activeTab === 'heart-rate' ? (
                <HeartRateTab onBack={() => setActiveTab('home')} />
              ) : (
                <ProfileTab />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 grid grid-cols-5 gap-y-0.5 px-2 py-1 z-50">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`tab-${tab.id}`}
                key={tab.id}
                onClick={() => {
                  feedback();
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-[#6C63FF]' : 'text-gray-500'
                }`}
              >
                <Icon size={20} className={isActive ? 'scale-110' : 'scale-100'} />
                <span className="text-[10px] mt-1 font-medium truncate w-full text-center">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 w-1 h-1 bg-[#6C63FF] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <NotificationInitializer />
        <AppContent />
      </NotificationProvider>
    </UserProvider>
  );
}
