import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Footprints, Timer, Heart, Zap, Play, Pause, Square } from 'lucide-react';

// Help helper to switch tabs in the prototype
const goToTab = (tabId: string) => {
  const tabButton = document.getElementById(`tab-${tabId}`);
  if (tabButton) tabButton.click();
};

const StepsWidget = () => {
  const [count, setCount] = useState(0);
  const goal = 10000;
  const target = 8432;

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      onClick={() => goToTab('stats')}
      whileTap={{ scale: 0.98 }}
      className="w-[320px] h-[160px] bg-[#1a1a1a] rounded-[20px] p-5 flex flex-col justify-between shrink-0 cursor-pointer snap-center border border-white/5 shadow-xl"
    >
      <div className="flex justify-between items-center text-gray-400">
        <div className="flex items-center space-x-2">
          <Footprints size={16} className="text-[#6C63FF]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Steps Today</span>
        </div>
        <span className="text-[10px] font-bold opacity-30 tracking-tight">HardReps</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-4xl font-black italic tracking-tighter text-white">
          {count.toLocaleString()}
        </h3>
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(target / goal) * 100}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-[#6C63FF] shadow-[0_0_10px_rgba(108,99,255,0.5)]"
          />
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">84% of goal</span>
          <span className="text-[10px] font-bold text-[#6C63FF] italic">1,568 remaining</span>
        </div>
      </div>
      
      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Goal: 10,000</p>
    </motion.div>
  );
};

const TimerWidget = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(45 * 60 + 23); // Start at 00:45:23
  
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      animate={{ 
        borderColor: isActive ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 255, 255, 0.05)',
        boxShadow: isActive ? '0 0 15px rgba(255, 107, 107, 0.1)' : 'none'
      }}
      className="w-[320px] h-[160px] bg-[#1a1a1a] rounded-[20px] p-5 flex flex-col justify-between shrink-0 snap-center border-2"
    >
      <div className="flex justify-between items-center text-gray-400">
        <div className="flex items-center space-x-2">
          <Timer size={16} className="text-[#6C63FF]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Workout Timer</span>
        </div>
        <span className="text-[10px] font-bold opacity-30 tracking-tight">HardReps</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-4xl font-mono font-black tracking-tighter text-[#6C63FF]">
          {formatTime(seconds)}
        </h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
          Push Day — <span className={isActive ? "text-[#FF6B6B] ml-1 flex items-center" : "ml-1"}>
            {isActive ? "Active 🔥" : "Ready ✨"}
          </span>
        </p>
      </div>

      <div className="flex space-x-2">
        {!isActive ? (
          <button 
            onClick={() => setIsActive(true)}
            className="flex-1 bg-[#6C63FF] text-white py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center space-x-1 shadow-lg shadow-[#6C63FF]/20"
          >
            <Play size={10} fill="currentColor" />
            <span>Start</span>
          </button>
        ) : (
          <button 
            onClick={() => setIsActive(false)}
            className="flex-1 bg-white/10 text-white py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center space-x-1"
          >
            <Pause size={10} fill="currentColor" />
            <span>Pause</span>
          </button>
        )}
        <button 
          onClick={() => {
            setIsActive(false);
            setSeconds(0);
          }}
          className="bg-white/5 text-gray-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center space-x-1 hover:text-white transition-colors"
        >
          <Square size={10} fill="currentColor" />
          <span>Stop</span>
        </button>
      </div>
    </motion.div>
  );
};

const HeartRateWidget = () => {
  const [bpm, setBpm] = useState(72);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const diff = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + diff;
        return Math.max(50, Math.min(180, newVal));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getZone = () => {
    if (bpm < 60) return { label: 'Low • Rest', color: '#6C63FF' };
    if (bpm <= 100) return { label: 'Normal Zone ✓', color: '#4CAF50' };
    return { label: 'High! ⚠️', color: '#FF6B6B' };
  };

  const zone = getZone();

  return (
    <motion.div 
      onClick={() => goToTab('stats')}
      whileTap={{ scale: 0.98 }}
      className="w-[320px] h-[160px] bg-[#1a1a1a] rounded-[20px] p-5 flex flex-col justify-between shrink-0 cursor-pointer snap-center border border-white/5 shadow-xl"
    >
      <div className="flex justify-between items-center text-gray-400">
        <div className="flex items-center space-x-2">
          <Heart size={16} className="text-[#FF6B6B]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Heart Rate</span>
        </div>
        <span className="text-[10px] font-bold opacity-30 tracking-tight">HardReps</span>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h3 className="text-4xl font-black italic tracking-tighter text-[#FF6B6B]">
            {bpm} <span className="text-xs font-bold uppercase tracking-widest opacity-50">BPM</span>
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: zone.color }}>
            {zone.label}
          </p>
        </div>
        
        {/* Animated Heartbeat Line */}
        <div className="w-24 h-12 overflow-hidden">
          <svg viewBox="0 0 100 40" className="w-full h-full">
            <motion.path
              d="M 0 20 L 20 20 L 25 10 L 35 30 L 40 20 L 60 20 L 65 5 L 75 35 L 80 20 L 100 20"
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1],
                pathOffset: [0, 0, 1],
                opacity: [0, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </svg>
        </div>
      </div>
      
      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Resting • Stable</p>
    </motion.div>
  );
};

export default function WidgetPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDots, setActiveDots] = useState(0);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPos = containerRef.current.scrollLeft;
      const index = Math.round(scrollPos / 320);
      setActiveDots(index);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center">
            <span className="bg-[#6C63FF] w-1.5 h-1.5 rounded-full mr-2"></span>
            📱 Home Screen Widgets
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">
            Press & hold to add on phone
          </p>
        </div>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex space-x-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-1"
      >
        <StepsWidget />
        <TimerWidget />
        <HeartRateWidget />
      </div>

      <div className="flex justify-center space-x-1.5 pt-1">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${activeDots === i ? 'w-4 bg-[#6C63FF]' : 'w-1 bg-white/10'}`}
          />
        ))}
      </div>
    </section>
  );
}
