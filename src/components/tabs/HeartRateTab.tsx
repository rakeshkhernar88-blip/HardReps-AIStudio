/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowLeft, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { COLORS } from '../../constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HeartRateTabProps {
  onBack: () => void;
}

export default function HeartRateTab({ onBack }: HeartRateTabProps) {
  const barData = {
    labels: Array.from({ length: 20 }, (_, i) => `${i + 1}/04`),
    datasets: [
      {
        label: 'HR Range',
        data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 60) + 60),
        backgroundColor: COLORS.accent,
        borderRadius: 4,
        barThickness: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { 
          color: '#555', 
          font: { size: 8 },
          callback: (val: any, index: number) => index % 10 === 0 ? barData.labels[index] : ''
        } 
      },
      y: { 
        position: 'right' as const,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#555', font: { size: 8 } }
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col p-6 overflow-y-auto"
    >
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">Heart rate</h2>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <CalendarIcon size={20} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-8 px-2">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Apr 2026</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black">51 - 137</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">BPM</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Average</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black">85</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">BPM</span>
          </div>
        </div>
      </div>

      <section className="bg-white/5 border border-white/5 rounded-3xl p-4 mb-8">
        <div className="h-48 relative">
          <Bar data={barData} options={options} />
        </div>
        <div className="flex justify-center space-x-4 mt-6">
           {['Day', 'Week', 'Month', 'Year'].map(label => (
             <button 
                key={label}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${label === 'Month' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
             >
                {label}
             </button>
           ))}
        </div>
      </section>

      <section className="bg-white/5 border border-white/5 rounded-3xl p-5 mb-8">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-bold text-[#6C63FF]/80">No heart rate data set</h3>
           <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Set now</button>
        </div>
        <p className="text-[10px] text-gray-500 font-medium">Allow automatic tracking in Settings to see your trends.</p>
      </section>

      <div className="space-y-6 px-1">
        <div>
          <h4 className="text-sm font-bold mb-3">What is Heart Rate?</h4>
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
            In simple words, your Heart Rate is an indicator of how well your body is functioning every day. When you define it technically, it monitors the flow of blood from your heart to other organs. When it comes to the numbers, it calculates the heart beats per minute (BPM), every time the blood from your heart flows and reaches your arteries.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold mb-2">Disclaimer</h4>
          <p className="text-[10px] text-gray-500 font-bold italic mb-4">For fitness and wellness purpose only.</p>
          <button className="text-[#6C63FF] text-xs font-bold hover:underline underline-offset-4">Learn more</button>
        </div>
      </div>
    </motion.div>
  );
}
