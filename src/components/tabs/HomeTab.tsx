/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { StepsRing, CaloriesRing } from './StatsRings';
import { MOCK_DATA, COLORS } from '../../constants';
import { RefreshCcw, TrendingUp, Moon, BookText, Activity, LayoutGrid } from 'lucide-react';
import { feedback } from '../../lib/haptics';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SmartAssistant from '../SmartAssistant';
import WidgetPreview from '../WidgetPreview';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function HomeTab() {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    if (isSyncing) return;
    feedback();
    setIsSyncing(true);
    
    // Simulate smart sync
    setTimeout(() => {
      setIsSyncing(false);
      addNotification(
        'Data Synced',
        'Google Fit data has been updated with your latest activities.',
        'success'
      );
    }, 2000);
  };

  const handleCardClick = (title: string, value: string) => {
    feedback();
    addNotification(
      title,
      `Current performance: ${value}. Coaching tip: Consistency is key to long-term progress!`,
      'info'
    );
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Steps',
        data: MOCK_DATA.weeklySteps,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        barThickness: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: COLORS.textMuted, font: { size: 10 } } 
      },
      y: { 
        display: false 
      },
    },
  };

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Premium Header */}
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">HARDREPS</h1>
          <div className="flex items-center space-x-1.5 -mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Sync Active</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 hover:bg-white/10 transition-all active:scale-90">
            <RefreshCcw size={18} className={`text-gray-400 ${isSyncing ? 'animate-spin' : ''}`} onClick={handleSync} />
            {isSyncing && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#6C63FF] rounded-full border-2 border-[#0a0a0a]"></span>}
          </button>
          <div 
            onClick={() => {
              feedback();
              const event = new CustomEvent('navigate-tab', { detail: 'profile' });
              window.dispatchEvent(event);
            }}
            className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10 cursor-pointer active:scale-90 transition-transform shadow-lg shadow-black/50"
          >
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Quick Actions Bento */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { id: 'sleep', icon: Moon, label: 'Sleep', color: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/10' },
          { id: 'journal', icon: BookText, label: 'Journal', color: 'bg-orange-500/10 text-orange-400', border: 'border-orange-500/10' },
          { id: 'body', icon: Activity, label: 'Body', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/10' },
          { id: 'board', icon: LayoutGrid, label: 'Board', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/10' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              feedback();
              const event = new CustomEvent('navigate-tab', { detail: item.id });
              window.dispatchEvent(event);
            }}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className={`w-full aspect-square rounded-3xl ${item.color} flex items-center justify-center border ${item.border} group-active:scale-95 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md`}>
              <item.icon size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 group-hover:text-white transition-colors">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Greeting Section */}
      <div className="px-1 py-2">
        <h2 className="text-3xl font-black text-white tracking-tight leading-none">Hello, {user.name.split(' ')[0]}</h2>
        <p className="text-sm text-gray-400 font-medium tracking-tight mt-1 opacity-80">Ready to crush your goals today?</p>
      </div>

      {/* Stats Glass Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleCardClick('Steps', MOCK_DATA.stats.steps.toLocaleString())}
          className="text-left bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 rounded-[2.5rem] border border-white/5 active:scale-95 transition-all shadow-xl relative overflow-hidden group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6C63FF] mb-1">Steps Today</p>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-black text-white tracking-tighter">{MOCK_DATA.stats.steps.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-black tracking-widest uppercase">
            <TrendingUp size={10} className="mr-1" />
            {Math.floor((MOCK_DATA.stats.steps / 10000) * 100)}% Goal
          </div>
          <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <StepsRing progress={MOCK_DATA.stats.steps / 10000} size={48} strokeWidth={4} />
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#6C63FF]/5 blur-3xl rounded-full" />
        </button>

        <button 
          onClick={() => handleCardClick('Calories', MOCK_DATA.stats.calories.toLocaleString())}
          className="text-left bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 rounded-[2.5rem] border border-white/5 active:scale-95 transition-all shadow-xl relative overflow-hidden group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6B6B] mb-1">Burned</p>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-black text-white tracking-tighter">{MOCK_DATA.stats.calories.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kcal</span>
          </div>
          <div className="flex items-center text-[10px] text-gray-500 font-black tracking-widest uppercase">
            642 to go
          </div>
          <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <CaloriesRing progress={0.65} size={48} strokeWidth={4} />
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#FF6B6B]/5 blur-3xl rounded-full" />
        </button>

        <button 
          onClick={() => {
            feedback();
            const event = new CustomEvent('navigate-tab', { detail: 'heart-rate' });
            window.dispatchEvent(event);
          }}
          className="text-left bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 rounded-[2.5rem] border border-white/5 active:scale-95 transition-all shadow-xl relative overflow-hidden group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Focus</p>
          <div className="flex items-baseline space-x-1 mb-3">
            <span className="text-2xl font-black text-white tracking-tighter">{MOCK_DATA.stats.bpm}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">BPM</span>
          </div>
          <div className="flex space-x-1.5 h-4 items-end">
            {[0.4, 0.6, 0.9, 0.7, 0.3, 0.2].map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: `${h * 100}%` }}
                className={`flex-1 rounded-full ${i < 4 ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-white/5'}`} 
              />
            ))}
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
        </button>

        <button 
          onClick={() => handleCardClick('Sleep', `${MOCK_DATA.stats.sleep} Hrs`)}
          className="text-left bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 rounded-[2.5rem] border border-white/5 active:scale-95 transition-all shadow-xl relative overflow-hidden group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Recover</p>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-black text-white tracking-tighter">{MOCK_DATA.stats.sleep}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hrs</span>
          </div>
          <p className="text-[11px] text-indigo-400 font-black tracking-widest uppercase">Grade A+</p>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full" />
        </button>
      </div>

      {/* Modern Widget Section */}
      <section className="space-y-4 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] shadow-[0_0_10px_rgba(108,99,255,0.6)]" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">Dynamic Interface</h3>
          </div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">v2.4 active</span>
        </div>
        
        <div className="relative group perspective-1000">
          <div className="overflow-hidden rounded-[2.8rem] border border-white/10 shadow-3xl bg-[#0d0d0d] relative z-10 transition-transform duration-500 group-hover:rotate-x-2">
             <WidgetPreview data={MOCK_DATA.stats} />
          </div>
          <div className="flex justify-center space-x-2 mt-5">
            <div className="w-8 h-1 bg-[#6C63FF] rounded-full shadow-[0_0_10px_rgba(108,99,255,0.4)]" />
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="w-1 h-1 bg-white/10 rounded-full" />
          </div>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-[#6C63FF]/10 blur-[40px] rounded-full -z-10 group-hover:bg-[#6C63FF]/20 transition-all" />
        </div>
      </section>

      {/* Weekly Activity Data Visualization */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111111] p-7 rounded-[2.8rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase mb-1">Performance</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Step distribution weekly</p>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white transition-all active:scale-90"
          >
            <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="h-44 relative z-10">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#6C63FF]/5 blur-[100px] rounded-full -z-10" />
      </div>

      <SmartAssistant />

      {/* Floating CTA */}
      <div className="sticky bottom-4 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button 
          onClick={() => {
            feedback();
            const event = new CustomEvent('navigate-tab', { detail: 'train' });
            window.dispatchEvent(event);
          }}
          className="pointer-events-auto bg-[#6C63FF] text-white py-4.5 px-12 rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] shadow-[0_20px_40px_rgba(108,99,255,0.4)] active:scale-95 transition-all hover:shadow-[0_10px_30px_rgba(108,99,255,0.6)] transform translate-y-2"
        >
          Begin Session
        </button>
      </div>
    </div>
  );
}
