/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Trophy, Star, Shield, Zap } from 'lucide-react';
import { MOCK_DATA } from '../../constants';

export default function BoardTab() {
  const completion = (MOCK_DATA.stats.steps / MOCK_DATA.stats.stepsGoal) * 100;
  
  // milestones: 25, 50, 75, 100
  const milestones = [25, 50, 75, 100];
  const grid = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Goal Board</h2>
        <p className="text-sm text-gray-500">Weekly Milestone Challenge</p>
      </header>

      <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 space-y-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Your Progress</p>
            <p className="text-2xl font-bold">{Math.round(completion)}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold text-[#6C63FF]">Current Rank</p>
            <p className="text-lg font-bold">Silver IV</p>
          </div>
        </div>
        <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B]"
          />
          {milestones.map(m => (
            <div key={m} className="absolute top-0 w-px h-full bg-white/20" style={{ left: `${m}%` }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 bg-[#1a1a1a] p-2 rounded-2xl border border-white/5 shadow-xl">
        {grid.map((i) => {
          const isMilestone = milestones.includes(i);
          const isCompleted = i <= completion;
          const isCurrent = Math.floor(completion) === i;

          return (
            <div 
              key={i} 
              className={`aspect-square rounded-[3px] flex items-center justify-center relative transition-all duration-500 ${
                isCompleted 
                  ? 'bg-[#6C63FF]/40 border-[#6C63FF]/30' 
                  : 'bg-black/40 border-white/5'
              } border`}
            >
              {isMilestone && (
                <Star size={8} className="text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]" />
              )}
              {isCurrent && (
                <motion.div 
                  layoutId="currentPos"
                  className="absolute inset-0 bg-[#6C63FF] rounded-[2px]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Milestone Rewards</h3>
        <div className="space-y-2">
          {[
            { pos: 25, icon: Zap, label: "Energy Boost Badge", color: "text-[#6C63FF]" },
            { pos: 50, icon: Shield, label: "Consistency Warrior", color: "text-[#4CAF50]" },
            { pos: 75, icon: Star, label: "HardReps Elite", color: "text-amber-400" },
            { pos: 100, icon: Trophy, label: "Weekly Champion", color: "text-[#FF6B6B]" },
          ].map((reward) => (
            <div key={reward.pos} className={`flex items-center justify-between p-3 rounded-2xl border border-white/5 ${completion >= reward.pos ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]/50 opacity-40'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full bg-black/40 flex items-center justify-center ${reward.color}`}>
                  <reward.icon size={16} />
                </div>
                <div>
                   <p className="text-xs font-bold">{reward.label}</p>
                   <p className="text-[10px] text-gray-500">Reached at {reward.pos}%</p>
                </div>
              </div>
              {completion >= reward.pos && <CheckCircle className="text-[#4CAF50]" size={16} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
