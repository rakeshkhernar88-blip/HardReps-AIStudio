/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronDown, ChevronUp, Timer, Flame, Activity, Zap, TrendingUp, Plus, Minus, ChevronRight, X, Edit2 } from 'lucide-react';
import { MOCK_DATA, COLORS } from '../../constants';
import { feedback, triggerHaptic, playClickSound } from '../../lib/haptics';

import { WorkoutSession } from '../WorkoutSessionCard';

interface TrainTabProps {
  onFinish: (workout: WorkoutSession) => void;
}

export default function TrainTab({ onFinish }: TrainTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [sessionWeights, setSessionWeights] = useState<Record<string, number[]>>({});
  const [showOverloadTip, setShowOverloadTip] = useState<{ exId: string; setId: number } | null>(null);
  const [manualWeightInput, setManualWeightInput] = useState<string>('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [sessionExercises, setSessionExercises] = useState(MOCK_DATA.exercises);
  const [editingExercise, setEditingExercise] = useState<typeof MOCK_DATA.exercises[0] | null>(null);

  useEffect(() => {
    if (!isStarted) return;
    
    // Initialize session exercises from MOCK_DATA if they are different (e.g. fresh start)
    setSessionExercises(MOCK_DATA.exercises);
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted) return;
    
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    triggerHaptic([50, 30, 50]); // Success pattern
    playClickSound();
    setIsStarted(false);
    // Construct session data
    const sessionData: WorkoutSession = {
      id: `h-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      name: 'Push Day (Finished)',
      duration: formatTime(secondsElapsed),
      calories: 320,
      exercises: sessionExercises.map(ex => {
        const weights = sessionWeights[ex.id] || new Array(ex.sets).fill(ex.weight);
        const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
        
        return {
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps.toString(),
          weight: avgWeight > 0 ? `${avgWeight}kg` : 'BW'
        };
      })
    };
    
    onFinish(sessionData);
  };

  const toggleExpand = (id: string) => {
    feedback();
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    const isNowCompleted = !(completedSets[exerciseId]?.[setIndex]);
    
    if (isNowCompleted) {
      triggerHaptic(30); // Medium pulse
      playClickSound();
    } else {
      triggerHaptic(10); // Light undo tap
      playClickSound();
    }

    setCompletedSets(prev => {
      const sets = [...(prev[exerciseId] || new Array(sessionExercises.find(e => e.id === exerciseId)?.sets || 3).fill(false))];
      sets[setIndex] = !sets[setIndex];
      return { ...prev, [exerciseId]: sets };
    });

    if (isNowCompleted) {
      // Suggest overload for next set or session
      const ex = sessionExercises.find(e => e.id === exerciseId);
      const currentWeights = sessionWeights[exerciseId] || new Array(ex?.sets || 3).fill(ex?.weight || 0);
      const currentWeight = currentWeights[setIndex];
      
      // Calculate specific increase: 2.5kg for < 50kg, 5kg for >= 50kg
      const increase = currentWeight >= 50 ? 5 : 2.5;
      const suggestion = currentWeight + increase;
      
      setManualWeightInput(suggestion.toString());
      setShowOverloadTip({ exId: exerciseId, setId: setIndex });
      // Removed auto-dismiss timer to make it strictly manual/dismissible as requested
    }
  };

  const handleUpdateExercise = (updatedEx: typeof MOCK_DATA.exercises[0]) => {
    setSessionExercises(prev => prev.map(ex => ex.id === updatedEx.id ? updatedEx : ex));
    
    // Adjust completed sets and weights if sets count changed
    setCompletedSets(prev => {
      const existing = prev[updatedEx.id] || [];
      if (existing.length === updatedEx.sets) return prev;
      
      let newSets = [...existing];
      if (newSets.length < updatedEx.sets) {
        newSets = [...newSets, ...new Array(updatedEx.sets - newSets.length).fill(false)];
      } else {
        newSets = newSets.slice(0, updatedEx.sets);
      }
      return { ...prev, [updatedEx.id]: newSets };
    });

    setSessionWeights(prev => {
      const existing = prev[updatedEx.id] || [];
      if (existing.length === updatedEx.sets) return prev;

      let newWeights = [...existing];
      if (newWeights.length < updatedEx.sets) {
        newWeights = [...newWeights, ...new Array(updatedEx.sets - newWeights.length).fill(updatedEx.weight)];
      } else {
        newWeights = newWeights.slice(0, updatedEx.sets);
      }
      return { ...prev, [updatedEx.id]: newWeights };
    });

    setEditingExercise(null);
  };

  const adjustWeight = (exId: string, setIndex: number, amount: number) => {
    feedback();
    setSessionWeights(prev => {
      const ex = sessionExercises.find(e => e.id === exId);
      const weights = [...(prev[exId] || new Array(ex?.sets || 3).fill(ex?.weight || 0))];
      weights[setIndex] = Math.max(0, weights[setIndex] + amount);
      return { ...prev, [exId]: weights };
    });
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
        <div className="w-24 h-24 bg-[#6C63FF]/10 rounded-full flex items-center justify-center relative">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ type: "tween", duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#6C63FF] rounded-full"
          />
          <Zap size={40} className="text-[#6C63FF] relative z-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black italic tracking-tighter">MORNING PUSH DAY</h2>
          <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
            4 Exercises • 14 Sets total • Focused on Progressive Overload
          </p>
        </div>

        <button 
          onClick={() => { feedback(); setIsStarted(true); }}
          className="w-full max-w-[280px] bg-[#6C63FF] text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-[#6C63FF]/30 active:scale-95 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest"
        >
          <span>Start Workout</span>
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-bold">Active Session</h2>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">Morning Push Day</p>
              <div className="flex items-center space-x-1 bg-[#6C63FF]/10 px-2 py-0.5 rounded-full">
                <Zap size={10} className="text-[#6C63FF]" />
                <span className="text-[9px] font-bold text-[#6C63FF] uppercase tracking-tighter">Overloading</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#4CAF50] block">SESSION PROGRESS</span>
            <span className="text-lg font-black text-white leading-none">
              {Math.round(
                (Object.values(completedSets).flat().filter(Boolean).length / 
                sessionExercises.reduce((acc, curr) => acc + curr.sets, 0)) * 100
              )}%
            </span>
          </div>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ 
              width: `${(Object.values(completedSets).flat().filter(Boolean).length / 
              sessionExercises.reduce((acc, curr) => acc + curr.sets, 0)) * 100}%` 
            }}
            className="h-full bg-gradient-to-r from-[#6C63FF] to-[#4CAF50]"
          />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 text-center">
          <Timer size={14} className="mx-auto mb-1 text-[#6C63FF]" />
          <p className="text-[10px] text-gray-500 uppercase">Duration</p>
          <p className="text-sm font-bold font-mono text-[#6C63FF]">{formatTime(secondsElapsed)}</p>
        </div>
        <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 text-center">
          <Flame size={14} className="mx-auto mb-1 text-[#FF6B6B]" />
          <p className="text-[10px] text-gray-500 uppercase">Calories</p>
          <p className="text-sm font-bold">320</p>
        </div>
        <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 text-center">
          <Activity size={14} className="mx-auto mb-1 text-[#4CAF50]" />
          <p className="text-[10px] text-gray-500 uppercase">Avg BPM</p>
          <p className="text-sm font-bold">128</p>
        </div>
      </div>

      <div className="space-y-3">
        {sessionExercises.map((ex) => {
          const isExpanded = expandedId === ex.id;
          const currentCompleted = completedSets[ex.id] || new Array(ex.sets).fill(false);
          const completedCount = currentCompleted.filter(Boolean).length;
          const progressPercentage = (completedCount / ex.sets) * 100;

          return (
            <div 
              key={ex.id}
              className={`bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-[#6C63FF]/50 shadow-lg shadow-[#6C63FF]/5' : ''}`}
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer relative"
                onClick={() => toggleExpand(ex.id)}
              >
                {/* Progress Background Bar */}
                <div className="absolute bottom-0 left-0 h-[4px] bg-[#1a1a1a] w-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="h-full bg-[#4CAF50]/60 shadow-[0_0_8px_rgba(76,175,80,0.3)] transition-all duration-500"
                  />
                </div>

                <div className="flex items-center space-x-4 relative z-10">
                  <motion.div 
                    animate={{ 
                      scale: completedCount === ex.sets ? [1, 1.2, 1] : 1,
                      backgroundColor: completedCount === ex.sets ? 'rgba(76, 175, 80, 0.2)' : 'rgba(108, 99, 255, 0.2)'
                    }}
                    transition={{ type: "tween", duration: 0.4 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${completedCount === ex.sets ? 'text-[#4CAF50]' : 'text-[#6C63FF]'}`}
                  >
                    {completedCount === ex.sets ? (
                      <motion.div 
                        initial={{ scale: 0, rotate: -30 }} 
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                      >
                        <CheckCircle2 size={22} />
                      </motion.div>
                    ) : (
                      <span className="font-bold">{ex.name[0]}</span>
                    )}
                  </motion.div>
                  <div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setEditingExercise({...ex}); triggerHaptic(20); }}
                      className="hover:opacity-75 transition-opacity cursor-pointer group"
                    >
                      <h3 className="font-semibold text-sm flex items-center space-x-1">
                        <span>{ex.name}</span>
                        <Plus size={10} className="text-[#6C63FF] opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
                      </h3>
                      <p className="text-[10px] text-gray-500">{ex.sets} sets × {ex.reps} reps • {ex.weight > 0 ? `${ex.weight}kg` : 'BW'}</p>
                    </div>
                    <div className="flex space-x-1 mt-1.5">
                      {currentCompleted.map((isDone, idx) => (
                        <motion.div 
                          key={idx}
                          initial={false}
                          animate={{ 
                            backgroundColor: isDone ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                            scale: isDone ? [1, 1.3, 1] : 1,
                            boxShadow: isDone ? '0 0 8px rgba(76, 175, 80, 0.4)' : 'none'
                          }}
                          transition={{ 
                            type: "tween",
                            duration: 0.3,
                            ease: "easeOut"
                          }}
                          className="w-1.5 h-1.5 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 relative z-10">
                   <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-bold ${completedCount === ex.sets ? 'text-[#4CAF50]' : 'text-gray-300'}`}>
                      {Math.round(progressPercentage)}%
                    </span>
                    <span className="text-[8px] text-gray-600 font-medium">
                      {completedCount}/{ex.sets}
                    </span>
                   </div>
                   <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown size={16} className="text-gray-600" />
                   </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 border-t border-white/5 pt-4 space-y-2 bg-black/10"
                  >
                    {Array.from({ length: ex.sets }).map((_, i) => {
                      const currentWeight = (sessionWeights[ex.id] || new Array(ex.sets).fill(ex.weight))[i];
                      const isShowingTip = showOverloadTip?.exId === ex.id && showOverloadTip?.setId === i;

                      return (
                      <motion.div 
                        key={i} 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex flex-col space-y-2 p-3 rounded-2xl transition-all ${
                          currentCompleted[i] ? 'bg-[#4CAF50]/5 border border-[#4CAF50]/10' : 'bg-[#0a0a0a]/50 border border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium transition-all duration-300 ${currentCompleted[i] ? 'text-[#4CAF50]/50' : 'text-gray-500'}`}>
                            Set {i + 1}
                          </span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                              <button 
                                onClick={(e) => { e.stopPropagation(); adjustWeight(ex.id, i, -2.5); }}
                                className="text-gray-500 hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <div className="relative">
                                <span className={`text-xs font-bold transition-all min-w-[40px] text-center block duration-300 ${currentCompleted[i] ? 'text-gray-600' : 'text-gray-300'}`}>
                                  {ex.reps} × {currentWeight > 0 ? `${currentWeight}kg` : 'BW'}
                                </span>
                                {currentCompleted[i] && (
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: '100%' }} 
                                    className="absolute top-1/2 left-0 h-[1.5px] bg-[#4CAF50]/30 -translate-y-1/2"
                                  />
                                )}
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); adjustWeight(ex.id, i, 2.5); }}
                                className="text-gray-500 hover:text-[#6C63FF] transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSet(ex.id, i); }}
                              className="relative"
                            >
                              <motion.div
                                animate={{ 
                                  scale: currentCompleted[i] ? [1, 1.4, 1] : 1,
                                  backgroundColor: currentCompleted[i] ? '#4CAF50' : 'transparent',
                                  borderColor: currentCompleted[i] ? '#4CAF50' : 'rgba(255,255,255,0.2)'
                                }}
                                transition={{ type: "tween", duration: 0.3 }}
                                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-shadow ${currentCompleted[i] ? 'shadow-lg shadow-[#4CAF50]/20' : ''}`}
                              >
                                {currentCompleted[i] && (
                                  <motion.div 
                                    initial={{ scale: 0, rotate: -20, opacity: 0 }} 
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ 
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 15
                                    }}
                                  >
                                    <CheckCircle2 size={16} className="text-white" />
                                  </motion.div>
                                )}
                              </motion.div>
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isShowingTip && i < ex.sets - 1 && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-[#6C63FF]/10 p-3 rounded-xl space-y-3 border border-[#6C63FF]/20 mt-2 relative overflow-hidden"
                            >
                              {/* Background Pulse Effect */}
                              <motion.div 
                                animate={{ opacity: [0.05, 0.1, 0.05] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-[#6C63FF]"
                              />
                              
                              <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center space-x-2">
                                  <div className="p-1 bg-[#6C63FF] rounded-md shadow-lg shadow-[#6C63FF]/20">
                                    <TrendingUp size={10} className="text-white" />
                                  </div>
                                  <span className="text-[10px] text-[#6C63FF] font-black uppercase tracking-wider">Overload Prompt</span>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowOverloadTip(null); }}
                                  className="text-gray-500 hover:text-white transition-colors"
                                >
                                  <Plus size={12} className="rotate-45" />
                                </button>
                              </div>

                              <div className="flex flex-col space-y-2 relative z-10">
                                <p className="text-[10px] text-gray-300">
                                  Solid depth! Suggested overload: <span className="text-[#6C63FF] font-bold">+{currentWeight >= 50 ? '5' : '2.5'}kg</span>
                                </p>
                                
                                <div className="flex items-center space-x-2">
                                  <div className="relative flex-1">
                                    <input 
                                      type="number"
                                      step="0.5"
                                      value={manualWeightInput}
                                      onChange={(e) => setManualWeightInput(e.target.value)}
                                      className="w-full bg-black/60 border border-white/10 rounded-lg py-2 px-3 text-xs font-bold text-white focus:border-[#6C63FF] focus:outline-none transition-all pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">kg</span>
                                  </div>
                                  
                                  <div className="flex space-x-1">
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        triggerHaptic([20, 20]); 
                                        const suggestion = (parseFloat(manualWeightInput) || 0);
                                        setSessionWeights(prev => {
                                          const weights = [...(prev[ex.id] || new Array(ex.sets).fill(ex.weight))];
                                          for(let next = i+1; next < ex.sets; next++) weights[next] = suggestion;
                                          return { ...prev, [ex.id]: weights };
                                        });
                                        setShowOverloadTip(null); 
                                      }}
                                      className="bg-[#6C63FF] text-white px-3 py-2 rounded-lg font-bold text-[10px] shadow-lg shadow-[#6C63FF]/30 active:scale-95 transition-all whitespace-nowrap"
                                    >
                                      Apply to Next Sets
                                    </button>
                                  </div>
                                </div>

                                <div className="flex space-x-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentWeights = sessionWeights[ex.id] || new Array(ex.sets).fill(ex.weight);
                                      setManualWeightInput((currentWeights[i]).toString());
                                    }}
                                    className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                                  >
                                    Same as last
                                  </button>
                                  <span className="text-[9px] text-gray-700">|</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentWeights = sessionWeights[ex.id] || new Array(ex.sets).fill(ex.weight);
                                      const inc = currentWeights[i] >= 50 ? 5 : 2.5;
                                      setManualWeightInput((currentWeights[i] + inc).toString());
                                    }}
                                    className="text-[9px] text-[#6C63FF]/70 hover:text-[#6C63FF] transition-colors font-bold"
                                  >
                                    +{currentWeight >= 50 ? '5' : '2.5'}kg Suggestion
                                  </button>
                                  <span className="text-[9px] text-gray-700">|</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowOverloadTip(null);
                                    }}
                                    className="text-[9px] text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {isShowingTip && i === ex.sets - 1 && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-[#4CAF50]/10 p-2 rounded-xl flex items-center space-x-2 border border-[#4CAF50]/20"
                            >
                              <Zap size={12} className="text-[#4CAF50]" />
                              <span className="text-[10px] text-[#4CAF50] font-bold">Great session! Higher weight suggested for next time.</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );})}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleFinish}
        className="w-full bg-[#1a1a1a] border border-[#6C63FF]/30 text-[#6C63FF] py-4 rounded-2xl font-bold active:bg-[#6C63FF]/10 transition-colors"
      >
        Finish Session
      </button>

      {/* Edit Exercise Modal */}
      <AnimatePresence>
        {editingExercise && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingExercise(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full bg-[#121212] rounded-[32px] p-6 relative z-10 border border-white/5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Edit2 size={18} className="text-[#6C63FF]" />
                  <h2 className="text-xl font-bold">Edit Exercise</h2>
                </div>
                <button onClick={() => setEditingExercise(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Exercise Name</label>
                  <input 
                    type="text" 
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Sets</label>
                    <div className="flex items-center bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setEditingExercise({...editingExercise, sets: Math.max(1, editingExercise.sets - 1)})}
                        className="p-4 text-gray-400 hover:text-white"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="flex-1 text-center font-bold">{editingExercise.sets}</span>
                      <button 
                        onClick={() => setEditingExercise({...editingExercise, sets: Math.min(10, editingExercise.sets + 1)})}
                        className="p-4 text-gray-400 hover:text-white"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Reps</label>
                    <input 
                      type="number" 
                      value={editingExercise.reps}
                      onChange={(e) => setEditingExercise({...editingExercise, reps: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-white font-bold text-center focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Base Weight (kg)</label>
                  <div className="flex items-center bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setEditingExercise({...editingExercise, weight: Math.max(0, editingExercise.weight - 2.5)})}
                      className="p-4 text-gray-400 hover:text-white"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      value={editingExercise.weight}
                      onChange={(e) => setEditingExercise({...editingExercise, weight: parseFloat(e.target.value) || 0})}
                      className="flex-1 bg-transparent text-center font-bold focus:outline-none"
                    />
                    <button 
                      onClick={() => setEditingExercise({...editingExercise, weight: editingExercise.weight + 2.5})}
                      className="p-4 text-gray-400 hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpdateExercise(editingExercise)}
                  className="w-full bg-[#6C63FF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#6C63FF]/20 active:scale-95 transition-all mt-4"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
