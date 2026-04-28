import React from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  Activity, 
  Moon, 
  BookText, 
  LayoutGrid, 
  UserCircle,
  ChevronRight,
  TrendingUp,
  Award,
  Bell
} from 'lucide-react';

import { feedback } from '../../lib/haptics';

interface HubItemProps {
  key?: string;
  id: string;
  icon: any;
  label: string;
  description: string;
  color: string;
  onClick: (id: string) => void;
}

function HubItem({ id, icon: Icon, label, description, color, onClick }: HubItemProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        feedback();
        onClick(id);
      }}
      className="bg-[#1a1a1a] border border-white/5 p-5 rounded-[2.5rem] flex flex-col items-start text-left space-y-4 hover:border-white/10 transition-all group"
    >
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-white">{label}</h3>
        <p className="text-[10px] text-gray-500 leading-tight">{description}</p>
      </div>
      <div className="pt-2 w-full flex justify-end">
        <ChevronRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
      </div>
    </motion.button>
  );
}

export default function HubTab({ onNavigate }: { onNavigate: (id: string) => void }) {
  const tools = [
    { 
      id: 'reminders', 
      icon: Bell, 
      label: 'Smart Reminders', 
      description: 'Customize your health and recovery alerts.',
      color: 'bg-red-500'
    },
    { 
      id: 'history', 
      icon: History, 
      label: 'History', 
      description: 'Your past sessions and achievements.',
      color: 'bg-blue-500'
    },
    { 
      id: 'board', 
      icon: Award, 
      label: 'Leaderboard', 
      description: 'See how you rank against the community.',
      color: 'bg-yellow-500'
    },
    { 
      id: 'body', 
      icon: Activity, 
      label: 'Body Predictor', 
      description: 'AI-powered physique estimations.',
      color: 'bg-green-500'
    },
    { 
      id: 'sleep', 
      icon: Moon, 
      label: 'Sleep Recovery', 
      description: 'Analyze your rest for better gains.',
      color: 'bg-indigo-500'
    },
    { 
      id: 'journal', 
      icon: BookText, 
      label: 'Training Journal', 
      description: 'Notes on your form and diet.',
      color: 'bg-orange-500'
    },
    { 
      id: 'profile', 
      icon: UserCircle, 
      label: 'My Profile', 
      description: 'Your details and fitness goals.',
      color: 'bg-[#6C63FF]'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-2xl font-bold">Toolbox</h2>
        <p className="text-gray-500 text-sm">Everything you need to master your fitness.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <HubItem 
            key={tool.id} 
            id={tool.id}
            icon={tool.icon}
            label={tool.label}
            description={tool.description}
            color={tool.color}
            onClick={onNavigate} 
          />
        ))}
      </div>

      <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group border-dashed">
        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-bold text-sm">Coming Soon</h3>
          <p className="text-[11px] text-gray-500">Dietary AI analysis and wearable sync integrations.</p>
        </div>
        <div className="absolute top-0 right-0 p-3 opacity-10 blur-sm group-hover:blur-none transition-all">
          <Activity size={80} className="text-[#6C63FF]" />
        </div>
      </div>
    </div>
  );
}
