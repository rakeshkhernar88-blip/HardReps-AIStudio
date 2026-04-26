/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Zap, TrendingUp } from 'lucide-react';
import { COLORS } from '../../constants';

export default function BodyPredictorTab() {
  const [muscle, setMuscle] = useState('Chest');
  const [currentSize, setCurrentSize] = useState(100);
  const [targetSize, setTargetSize] = useState(110);
  const [frequency, setFrequency] = useState(3);
  const [diet, setDiet] = useState('Maintain');

  const muscles = ['Bicep', 'Chest', 'Shoulder', 'Back', 'Legs'];

  // Predictive logic (mock)
  const diff = targetSize - currentSize;
  const growthRate = frequency * (diet === 'Bulk' ? 0.3 : diet === 'Maintain' ? 0.1 : 0.05);
  const months = Math.max(1, Math.ceil(diff / growthRate));

  const milestoneData = Array.from({ length: 6 }, (_, i) => ({
    x: i,
    y: currentSize + (i * growthRate > diff ? diff : i * growthRate)
  }));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Body Predictor</h2>
        <p className="text-sm text-gray-500">AI-driven growth projections</p>
      </header>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {muscles.map((m) => (
          <button
            key={m}
            onClick={() => setMuscle(m)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
              muscle === m ? 'bg-[#6C63FF] text-white' : 'bg-[#1a1a1a] text-gray-500 border border-white/5'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <div>
              <p className="text-[10px] text-gray-500 uppercase mb-2">Current Size (cm)</p>
              <input 
                type="number" 
                value={currentSize} 
                onChange={(e) => setCurrentSize(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]"
              />
           </div>
           <div>
              <p className="text-[10px] text-gray-500 uppercase mb-2">Target Size (cm)</p>
              <input 
                type="number" 
                value={targetSize} 
                onChange={(e) => setTargetSize(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#6C63FF]"
              />
           </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <p className="text-[10px] text-gray-500 uppercase">Frequency (Days/Week)</p>
            <span className="text-xs font-bold text-[#6C63FF]">{frequency}d</span>
          </div>
          <input 
            type="range" min="1" max="6" value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#6C63FF]"
          />
        </div>

        <div className="flex items-center space-x-2 p-1 bg-black/50 rounded-2xl">
          {['Bulk', 'Maintain', 'Cut'].map(d => (
            <button
              key={d}
              onClick={() => setDiet(d)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${
                diet === d ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-gray-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        key={`${muscle}-${months}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#6C63FF] to-[#FF6B6B] p-6 rounded-3xl shadow-xl space-y-4"
      >
        <div className="flex justify-between items-start">
           <div>
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider">Estimated Timeline</h3>
              <p className="text-4xl font-black text-white">{months} <span className="text-xl font-normal">Months</span></p>
           </div>
           <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
             <TrendingUp className="text-white" size={24} />
           </div>
        </div>

        <div className="h-16 flex items-end space-x-1">
          {milestoneData.map((d, i) => (
             <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${((d.y - currentSize) / (targetSize - currentSize + 1)) * 100}%` }}
                className="bg-white/30 flex-1 rounded-t-sm"
             />
          ))}
        </div>

        <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-md">
           <div className="flex items-center space-x-2 mb-1">
              <Zap size={14} className="text-white" />
              <p className="text-[10px] font-bold text-white uppercase">Pro Tip</p>
           </div>
           <p className="text-[10px] text-white/80 leading-normal">
             To reach {targetSize}cm {muscle.toLowerCase()} in {months} months, increase protein to 1.8g/kg and focus on progressive overload.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
