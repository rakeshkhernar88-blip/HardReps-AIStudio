/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Flame, ChevronRight, Dumbbell } from 'lucide-react';

export interface ExerciseSummary {
  name: string;
  sets: number | string;
  reps: string;
  weight: string;
}

export interface HeartRateZone {
  zone: number;
  label: string;
  sublabel: string;
  range: string;
  time: string;
  color: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: string;
  calories: number | string;
  exercises: ExerciseSummary[];
  startTime?: string;
  endTime?: string;
  avgHeartRate?: number;
  maxHeartRate?: number;
  heartRateZones?: HeartRateZone[];
}

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  isSelected: boolean;
  onToggle: () => void;
}

const WorkoutSessionCard: FC<WorkoutSessionCardProps> = ({ session, isSelected, onToggle }) => {
  return (
    <div 
      className={`bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 ${isSelected ? 'ring-1 ring-[#6C63FF]/50' : ''}`}
    >
      <div 
        className="p-5 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF]">
                <Dumbbell size={24} />
             </div>
             <div>
                <h3 className="font-bold text-base">{session.name}</h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{session.date}</p>
             </div>
          </div>
          <ChevronRight 
            size={18} 
            className={`text-gray-600 transition-transform duration-300 mt-2 ${isSelected ? 'rotate-90' : ''}`} 
          />
        </div>

        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <Clock size={14} className="text-[#6C63FF]" />
            <span className="text-[11px] font-bold text-gray-300">{session.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flame size={14} className="text-[#FF6B6B]" />
            <span className="text-[11px] font-bold text-gray-300">{session.calories} kcal</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-6 border-t border-white/5 pt-6 space-y-8"
          >
            {/* Session Stats Header */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Time</p>
                <p className="text-xl font-bold">{session.duration}:00</p>
                <p className="text-[10px] text-gray-500 mt-1">{session.startTime || '6:24 AM'} - {session.endTime || '7:41 AM'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Avg Heart Rate</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-xl font-bold text-[#FF6B6B]">{session.avgHeartRate || 105}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">bpm</p>
                </div>
              </div>
            </div>

            {/* Heart Rate Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h4 className="text-xs font-black uppercase tracking-widest text-[#6C63FF]">Heart Rate Details</h4>
                 <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-black">Max Rate</p>
                    <p className="text-xs font-bold text-white">{session.maxHeartRate || 148} bpm</p>
                 </div>
              </div>

              {/* Heart Rate Graph Simulation */}
              <div className="relative h-24 w-full bg-white/5 rounded-2xl border border-white/5 p-2 overflow-hidden">
                <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M0,30 L5,25 L10,28 L15,15 L20,35 L25,32 L30,28 L35,30 L40,25 L45,28 L50,22 L55,20 L60,18 L65,25 L70,15 L75,12 L80,18 L85,22 L90,20 L95,25 L100,28"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M0,30 L5,25 L10,28 L15,15 L20,35 L25,32 L30,28 L35,30 L40,25 L45,28 L50,22 L55,20 L60,18 L65,25 L70,15 L75,12 L80,18 L85,22 L90,20 L95,25 L100,28 L100,40 L0,40 Z"
                    fill="url(#hrGradient)"
                  />
                </svg>
                <div className="absolute bottom-1 left-3 text-[7px] text-gray-500 font-bold uppercase tracking-tight">{session.startTime || '6:24 AM'}</div>
                <div className="absolute bottom-1 right-3 text-[7px] text-gray-500 font-bold uppercase tracking-tight">{session.endTime || '7:41 AM'}</div>
              </div>

              {/* Heart Rate Zones */}
              <div className="space-y-1.5">
                {(session.heartRateZones || [
                  { zone: 0, label: 'Resting mode', sublabel: '-', range: '<94 bpm', time: '16m 10s', color: '#888888' },
                  { zone: 1, label: 'Warm Up', sublabel: '-', range: '94-113 bpm', time: '41m 0s', color: '#6C63FF' },
                  { zone: 2, label: 'Fat Burning', sublabel: '-', range: '114-132 bpm', time: '14m 10s', color: '#4FC3F7' },
                  { zone: 3, label: 'Aerobic', sublabel: '-', range: '133-150 bpm', time: '41m 0s', color: '#4CAF50' },
                ]).map((zone, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/[0.08] transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: zone.color }} />
                      <div>
                        <div className="flex items-center space-x-2">
                           <p className="text-[11px] font-black text-white">Zone {zone.zone}</p>
                           <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">{zone.label}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{zone.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-300">{zone.range}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#6C63FF] px-1">Exercise Performance</h4>
              <div className="grid gap-3">
                {session.exercises.map((ex, idx) => (
                  <div 
                    key={idx} 
                    className="relative overflow-hidden bg-white/5 border border-white/5 p-4 rounded-2xl group transition-all hover:bg-white/[0.07]"
                  >
                    <div className="flex justify-between items-center mb-3 relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 rounded-xl bg-black/40 text-[#6C63FF] border border-white/5 group-hover:scale-110 transition-transform">
                          <Dumbbell size={14} />
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-white tracking-tight">{ex.name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{ex.sets} Sets</span>
                            <span className="text-[10px] text-gray-500">•</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{ex.reps} Reps</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#6C63FF]">{ex.weight}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Load</p>
                      </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden relative z-10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-[#6C63FF] to-[#A099FF] shadow-[0_0_10px_rgba(108,99,255,0.3)]" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutSessionCard;
