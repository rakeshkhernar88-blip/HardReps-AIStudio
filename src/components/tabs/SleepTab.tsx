/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Moon, Star, Bell, Info } from 'lucide-react';
import { MOCK_DATA, COLORS } from '../../constants';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function SleepTab() {
  const { sleepData } = MOCK_DATA;
  
  const doughnutData = {
    labels: ['Deep', 'REM', 'Light', 'Awake'],
    datasets: [
      {
        data: [sleepData.deep, sleepData.rem, sleepData.light, sleepData.awake],
        backgroundColor: [
          '#6C63FF',
          '#FF6B6B',
          '#4CAF50',
          '#1a1a1a',
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const trendData = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        label: 'Quality',
        data: sleepData.weeklyTrend,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
        barThickness: 8,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false },
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sleep Insights</h2>
          <p className="text-sm text-gray-500">Quality: <span className="text-[#4CAF50]">Excellent</span></p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF]">
          <Moon size={20} />
        </div>
      </header>

      <section className="bg-[#1a1a1a] p-6 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
           <div className="space-y-4">
              <div>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Sleep</p>
                 <p className="text-3xl font-black">{sleepData.total} <span className="text-sm font-normal text-gray-500">Hrs</span></p>
              </div>
              <div className="flex space-x-6">
                 <div>
                    <p className="text-[10px] text-gray-500">Bedtime</p>
                    <p className="text-xs font-bold">{sleepData.bedtime}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-500">Wake time</p>
                    <p className="text-xs font-bold">{sleepData.wakeTime}</p>
                 </div>
              </div>
           </div>
           <div className="w-28 h-28">
              <Doughnut data={doughnutData} options={{...chartOptions, cutout: '75%'}} />
           </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5">
           <p className="text-[10px] text-gray-500 uppercase font-bold mb-3">Sleep Stages (min)</p>
           <div className="space-y-2">
              {[
                { label: 'Deep', val: sleepData.deep, color: 'bg-[#6C63FF]' },
                { label: 'REM', val: sleepData.rem, color: 'bg-[#FF6B6B]' },
                { label: 'Light', val: sleepData.light, color: 'bg-[#4CAF50]' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                      <span className="text-[10px] text-gray-400">{s.label}</span>
                   </div>
                   <span className="text-[10px] font-bold">{s.val}m</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5">
           <p className="text-[10px] text-gray-500 uppercase font-bold mb-3">7-Day Score</p>
           <div className="h-10 mb-2">
              <Bar data={trendData} options={chartOptions} />
           </div>
           <p className="text-[10px] text-gray-400">Avg Score: <span className="text-white">82</span></p>
        </div>
      </div>

      <div className="bg-[#6C63FF]/10 p-4 rounded-3xl border border-[#6C63FF]/20 flex items-start space-x-3">
         <div className="bg-[#6C63FF] p-1.5 rounded-xl text-white mt-1">
            <Info size={14} />
         </div>
         <div>
            <p className="text-xs font-bold text-white mb-1">Coach Note</p>
            <p className="text-[10px] text-gray-300 leading-normal">
              Your deep sleep is up 12% today. This is great for muscle recovery! Avoid screen time 30 min before bed tonight to maintain this.
            </p>
         </div>
      </div>
    </div>
  );
}
