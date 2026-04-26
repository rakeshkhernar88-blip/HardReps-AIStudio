/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Flame, ChevronRight } from 'lucide-react';

export interface ExerciseSummary {
  name: string;
  sets: number | string;
  reps: string;
  weight: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: string;
  calories: number | string;
  exercises: ExerciseSummary[];
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
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-sm">{session.name}</h3>
            <div className="flex items-center text-[10px] text-gray-500 mt-1">
              <Calendar size={10} className="mr-1" />
              {session.date}
            </div>
          </div>
          <ChevronRight 
            size={16} 
            className={`text-gray-600 transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`} 
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={12} className="text-[#6C63FF]" />
            <span className="text-[10px] font-medium text-gray-300">{session.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Flame size={12} className="text-[#FF6B6B]" />
            <span className="text-[10px] font-medium text-gray-300">{session.calories} kcal</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3"
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Exercise Summary</p>
            {session.exercises.map((ex, idx) => (
              <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-white">{ex.name}</p>
                  <p className="text-[9px] text-gray-500">{ex.sets} sets</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#6C63FF]">{ex.weight}</p>
                  <p className="text-[9px] text-gray-500">{ex.reps} reps</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutSessionCard;
