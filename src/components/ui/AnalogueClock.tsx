import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface AnalogueClockProps {
  initialTime: string; // "HH:MM AM/PM"
  onChange: (time: string) => void;
}

export default function AnalogueClock({ initialTime, onChange }: AnalogueClockProps) {
  const [hours, setHours] = useState(10);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [isSettingHours, setIsSettingHours] = useState(true);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [t, p] = initialTime.split(' ');
    const [h, m] = t.split(':').map(Number);
    setHours(h === 12 ? 12 : h % 12);
    setMinutes(m);
    setPeriod(p as 'AM' | 'PM');
  }, [initialTime]);

  const handleClockAction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    let normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    
    if (isSettingHours) {
      let h = Math.round((normalizedAngle / (2 * Math.PI)) * 12);
      if (h === 0) h = 12;
      setHours(h);
      updateTime(h, minutes, period);
    } else {
      let m = Math.round((normalizedAngle / (2 * Math.PI)) * 60);
      if (m === 60) m = 0;
      setMinutes(m);
      updateTime(hours, m, period);
    }
  };

  const updateTime = (h: number, m: number, p: 'AM' | 'PM') => {
    onChange(`${h}:${m.toString().padStart(2, '0')} ${p}`);
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    updateTime(hours, minutes, newPeriod);
  };

  return (
    <div className="flex flex-col items-center space-y-6 select-none">
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => setIsSettingHours(true)}
          className={`px-6 py-3 rounded-2xl text-xl font-black transition-all ${isSettingHours ? 'bg-[#6C63FF] text-white' : 'bg-white/5 text-gray-500'}`}
        >
          {hours}
        </button>
        <span className="text-xl font-black text-gray-700 self-center">:</span>
        <button 
          onClick={() => setIsSettingHours(false)}
          className={`px-6 py-3 rounded-2xl text-xl font-black transition-all ${!isSettingHours ? 'bg-[#6C63FF] text-white' : 'bg-white/5 text-gray-500'}`}
        >
          {minutes.toString().padStart(2, '0')}
        </button>
        <button 
          onClick={togglePeriod}
          className="px-6 py-3 rounded-2xl text-xl font-black bg-white/5 text-gray-500 hover:text-white transition-all uppercase"
        >
          {period}
        </button>
      </div>

      <div 
        ref={clockRef}
        onMouseDown={handleClockAction}
        onTouchMove={handleClockAction}
        className="w-64 h-64 rounded-full bg-[#1a1a1a] border-8 border-white/5 relative flex items-center justify-center shadow-2xl"
      >
        <div className="absolute w-2 h-2 bg-[#6C63FF] rounded-full z-20" />
        
        {/* Numbers */}
        {[...Array(12)].map((_, i) => {
          const num = i + 1;
          const angle = (num * 30 * Math.PI) / 180;
          const x = 100 * Math.sin(angle);
          const y = -100 * Math.cos(angle);
          return (
            <div 
              key={num}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute text-sm font-bold ${
                isSettingHours && hours === num ? 'text-[#6C63FF]' : 'text-gray-600'
              }`}
            >
              {num}
            </div>
          );
        })}

        {/* Hour Hand */}
        <motion.div 
          animate={{ rotate: (hours % 12) * 30 + (minutes / 60) * 30 - 90 }}
          className="absolute w-16 h-1.5 bg-white rounded-full origin-left transition-none z-10"
          style={{ transformOrigin: '0% 50%', left: '50%' }}
        />

        {/* Minute Hand */}
        <motion.div 
          animate={{ rotate: minutes * 6 - 90 }}
          className="absolute w-24 h-1 bg-[#6C63FF] rounded-full origin-left transition-none z-10"
          style={{ transformOrigin: '0% 50%', left: '50%' }}
        />

        {/* Minute Markers */}
        {!isSettingHours && [...Array(60)].map((_, i) => (
          i % 5 !== 0 && (
            <div 
              key={i}
              style={{ transform: `rotate(${i * 6}deg) translateY(-110px)` }}
              className="absolute w-0.5 h-1 bg-gray-800"
            />
          )
        ))}
      </div>
      
      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic">
        {isSettingHours ? 'Drag to set hours' : 'Drag to set minutes'}
      </p>
    </div>
  );
}
