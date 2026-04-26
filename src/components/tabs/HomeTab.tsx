/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { StepsRing, CaloriesRing } from './StatsRings';
import { MOCK_DATA, COLORS } from '../../constants';
import { RefreshCcw, TrendingUp, Moon, BookText, Activity, LayoutGrid } from 'lucide-react';
import { feedback } from '../../lib/haptics';
import { useUser } from '../../context/UserContext';
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
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4 pb-4">
        {[
          { id: 'sleep', icon: Moon, label: 'Sleep', color: 'bg-indigo-500' },
          { id: 'journal', icon: BookText, label: 'Journal', color: 'bg-orange-500' },
          { id: 'body', icon: Activity, label: 'Body', color: 'bg-green-500' },
          { id: 'board', icon: LayoutGrid, label: 'Board', color: 'bg-yellow-500' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              feedback();
              // This is a bit of a hack since HomeTab doesn't have setActiveTab
              // But we can dispatch a custom event or rely on Hub for now
              const event = new CustomEvent('navigate-tab', { detail: tool.id });
              window.dispatchEvent(event);
            }}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className={`w-12 h-12 rounded-2xl ${tool.color} bg-opacity-10 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95`}>
              <tool.icon size={20} className={tool.color.replace('bg-', 'text-')} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">{tool.label}</span>
          </button>
        ))}
      </div>

      <header className="mb-4">
        <h2 className="text-xl font-medium text-gray-400">Hello, <span className="text-white font-bold">{user.name}</span></h2>
        <p className="text-sm text-gray-500">Ready for your workout today?</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs text-gray-500 mb-1">Steps Today</p>
            <p className="text-2xl font-bold">{MOCK_DATA.stats.steps.toLocaleString()}</p>
            <p className="text-[10px] text-[#4CAF50] font-medium flex items-center mt-1">
              <TrendingUp size={10} className="mr-1" />
              84% of goal
            </p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-20">
            <StepsRing size={80} progress={0.84} />
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs text-gray-500 mb-1">Calories</p>
            <p className="text-2xl font-bold">{MOCK_DATA.stats.calories.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Burned today</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-20">
            <CaloriesRing size={80} progress={0.7} />
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5">
          <p className="text-xs text-gray-500 mb-1">Heart Rate</p>
          <p className="text-2xl font-bold">{MOCK_DATA.stats.bpm} <span className="text-xs font-normal text-gray-500">BPM</span></p>
          <div className="mt-2 flex items-center space-x-1">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-[#FF6B6B]' : 'bg-[#1a1a1a] border border-white/10'}`}></div>
             ))}
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5">
          <p className="text-xs text-gray-500 mb-1">Sleep</p>
          <p className="text-2xl font-bold">{MOCK_DATA.stats.sleep} <span className="text-xs font-normal text-gray-500">Hrs</span></p>
          <p className="text-[10px] text-[#6C63FF] font-medium mt-1">Deep: 72 min</p>
        </div>
      </section>

      <WidgetPreview />

      <section className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold">Weekly Activity</h3>
          <button className="text-[#6C63FF] text-[10px] font-bold uppercase tracking-wider flex items-center">
            <RefreshCcw size={10} className="mr-1" /> Sync
          </button>
        </div>
        <div className="h-32">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </section>

      <SmartAssistant />

      <div className="flex justify-center pt-2">
        <button className="bg-[#6C63FF] text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-[#6C63FF]/20 active:scale-95 transition-transform">
          Start Workout
        </button>
      </div>
    </div>
  );
}
