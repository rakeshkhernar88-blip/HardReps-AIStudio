import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar as CalendarIcon, Info, ChevronRight, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

interface HeartRateTabProps {
  onBack: () => void;
}

const MOCK_DATA = {
  avgHR: 85,
  maxHR: 148,
  workout: {
    name: "Night Run",
    date: "27 Apr 2026",
    kcal: 432,
    totalTime: "1h 12m",
    avgHR: 124,
    timeline: [
      { time: "0", hr: 72 },
      { time: "10", hr: 95 },
      { time: "20", hr: 115 },
      { time: "30", hr: 138 },
      { time: "40", hr: 125 },
      { time: "50", hr: 142 },
      { time: "60", hr: 110 },
      { time: "70", hr: 85 },
    ],
    zones: [
      { id: 0, label: "Resting", range: "<94 bpm", time: "16m 0s", color: "#888888", percentage: 22 },
      { id: 1, label: "Warm Up", range: "94-113 bpm", time: "41m 0s", color: "#3B82F6", percentage: 57 },
      { id: 2, label: "Fat Burning", range: "114-132 bpm", time: "14m 0s", color: "#06B6D4", percentage: 19 },
      { id: 3, label: "Aerobic", range: "133-150 bpm", time: "5m 0s", color: "#10B981", percentage: 7 },
      { id: 4, label: "Anaerobic", range: "150+ bpm", time: "2m 0s", color: "#F97316", percentage: 3 },
    ]
  },
  monthly: Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    hr: Math.floor(Math.random() * (137 - 51 + 1)) + 51
  }))
};

export default function HeartRateTab({ onBack }: HeartRateTabProps) {
  const [view, setView] = useState<'overview' | 'detail'>('overview');

  const WorkoutHRDetail = () => (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 overflow-y-auto pb-20 scrollbar-hide"
    >
      <header className="flex items-center space-x-4 mb-8">
        <button onClick={() => setView('overview')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight text-white italic">SESSION DETAIL</h2>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{MOCK_DATA.workout.name} • {MOCK_DATA.workout.date}</p>
        </div>
      </header>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2.5rem] border border-white/5 p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Calories</p>
            <p className="text-xl font-black text-white tracking-tighter">{MOCK_DATA.workout.kcal}</p>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Kcal</p>
          </div>
          <div className="text-center border-x border-white/5">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Duration</p>
            <p className="text-xl font-black text-white tracking-tighter">{MOCK_DATA.workout.totalTime}</p>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Active</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Avg HR</p>
            <p className="text-xl font-black text-[#FF6B6B] tracking-tighter">{MOCK_DATA.workout.avgHR}</p>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">BPM</p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/5 blur-3xl rounded-full" />
      </div>

      {/* Line Chart */}
      <div className="bg-[#1a1a1a] rounded-[2.8rem] border border-white/5 p-7 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50 flex items-center leading-none">
              <Activity size={14} className="mr-2 text-[#FF6B6B]" />
              Intensity Graph
            </h3>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Live Sync</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DATA.workout.timeline}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <RechartsTooltip 
                cursor={{ stroke: 'rgba(255,107,107,0.2)', strokeWidth: 2 }}
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,107,107,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#FF6B6B', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="hr" stroke="#FF6B6B" strokeWidth={4} fillOpacity={1} fill="url(#colorHr)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Breakdown */}
      <div className="space-y-6 px-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">Heart Rate Zones</h3>
        <div className="space-y-4">
          {MOCK_DATA.workout.zones.map((zone) => (
            <div key={zone.id} className="bg-gradient-to-r from-[#1a1a1a] to-transparent rounded-[2rem] p-5 border-l-4 border-y border-r border-white/5 shadow-lg group hover:bg-white/3 transition-colors" style={{ borderLeftColor: zone.color }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{zone.label}</h4>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest opacity-60">Zone {zone.id}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{zone.range}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white italic tracking-tighter">{zone.time}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: zone.color }}>{zone.percentage}%</p>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${zone.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 + zone.id * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const MonthlyHROverview = () => (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="flex-1 overflow-y-auto pb-20 scrollbar-hide"
    >
      <header className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-black text-white italic tracking-tight">HARDREPS HR</h2>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <CalendarIcon size={18} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-10 px-4">
        <div className="relative group">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.25em] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">Apr • 2026</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white tracking-widest leading-none">51-137</span>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">BPM</span>
          </div>
          <div className="absolute -bottom-2 left-0 w-8 h-1 bg-[#6C63FF] rounded-full" />
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.25em] mb-2 opacity-60">Avg Resting</p>
          <div className="flex items-baseline justify-end space-x-1">
            <span className="text-3xl font-black text-[#FF6B6B] tracking-widest leading-none">85</span>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">BPM</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <section className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-white/5 rounded-[3rem] p-8 mb-10 relative overflow-hidden shadow-2xl">
        <div className="h-56 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_DATA.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[0, 160]} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: '16px', fontSize: '10px', padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
                itemStyle={{ color: '#6C63FF', fontWeight: 'bold' }}
                labelStyle={{ color: '#444', marginBottom: '4px' }}
              />
              <Bar dataKey="hr" radius={[6, 6, 0, 0]} animationDuration={2000}>
                {MOCK_DATA.monthly.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.hr > 120 ? '#FF6B6B' : entry.hr > 100 ? '#6C63FF' : 'rgba(255,255,255,0.1)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center space-x-2 mt-10 relative z-10">
          {['Day', 'Week', 'Month', 'Year'].map(label => (
            <button 
              key={label}
              className={`px-7 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-90 ${label === 'Month' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#6C63FF]/5 blur-[100px] rounded-full -z-0" />
      </section>

      {/* Analytics Card */}
      <button 
        onClick={() => {
            setView('detail');
            try { window.navigator.vibrate(10); } catch(e) {}
        }}
        className="w-full bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-6 mb-10 flex items-center justify-between group active:scale-95 transition-all shadow-lg"
      >
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5 flex items-center justify-center text-[#FF6B6B] border border-[#FF6B6B]/10">
            <Activity size={28} />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black text-white italic tracking-tight mb-1">Session Insights</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Late Evening Run • 72m</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF6B6B] group-hover:text-white transition-all">
          <ChevronRight size={20} />
        </div>
      </button>

      {/* Footer Info */}
      <div className="space-y-10 px-4">
        <div className="bg-white/3 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-5">
            <Info size={18} className="text-[#6C63FF]" />
            <h4 className="text-xs font-black uppercase tracking-[0.25em] text-white">HR Bio-Metrics</h4>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium opacity-80">
            Heart Rate is an indicator of metabolic efficiency. It monitors blood flow volume from the left ventricle and tracks cardiovascular load in Real-Time. 
          </p>
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-[#6C63FF]/3 blur-[50px] rounded-full" />
        </div>

        <div className="pb-10">
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-4 flex items-center">
            <span className="w-8 h-[1px] bg-gray-800 mr-3"></span>
            Medical Disclaimer
          </p>
          <p className="text-[10px] text-gray-500 font-bold italic leading-relaxed">
            Data displayed is for informational purposes only. Consult a physician for accurate medical diagnostics. High precision sensors recommended.
          </p>
          <button className="text-[#6C63FF] text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex items-center hover:translate-x-2 transition-transform">
            VIEW FULL CLINICAL GUIDE <ChevronRight size={10} className="ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col p-6 overflow-hidden select-none"
    >
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'overview' ? (
            <MonthlyHROverview key="overview" />
          ) : (
            <WorkoutHRDetail key="detail" />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
