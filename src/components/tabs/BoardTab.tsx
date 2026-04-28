
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Shield, Zap, Users, Target, ChevronRight, Award, Medal, Flame } from 'lucide-react';
import { MOCK_DATA } from '../../constants';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { feedback } from '../../lib/haptics';


const LEADERBOARD_DATA = [
  { rank: 1, name: 'Alex Johnson', xp: 15600, avatar: 'https://i.pravatar.cc/150?u=alex', isMe: false },
  { rank: 2, name: 'Maria Silk', xp: 14200, avatar: 'https://i.pravatar.cc/150?u=maria', isMe: false },
  { rank: 3, name: 'You', xp: 12450, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop', isMe: true },
  { rank: 4, name: 'Steve Burn', xp: 11800, avatar: 'https://i.pravatar.cc/150?u=steve', isMe: false },
  { rank: 5, name: 'Sarah Kraft', xp: 9500, avatar: 'https://i.pravatar.cc/150?u=sarah', isMe: false },
];

interface Challenge {
  id: string;
  title: string;
  progress: number;
  goal: number;
  reward: string;
  icon: any;
}

const CHALLENGES: Challenge[] = [
  { id: 'c1', title: '500 Calorie Burn', progress: 320, goal: 500, reward: '50 XP', icon: Zap },
  { id: 'c2', title: 'Hydration Hero', progress: 3, goal: 5, reward: '100 XP', icon: Shield },
  { id: 'c3', title: 'Sleep Master', progress: 6, goal: 7, reward: '150 XP', icon: Star },
];

export default function BoardTab({ fitData }: { fitData?: any }) {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [activeView, setActiveView] = useState<'progress' | 'leaderboard' | 'badges'>('progress');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [reactions, setReactions] = useState<{ [key: string]: number }>({ '🔥': 12, '👏': 8, '🚀': 5 });

  const handleEmojiReact = (emoji: string) => {
    feedback();
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    addNotification(
      'Reaction Sent!',
      `You cheered with a ${emoji} emoji.`,
      'success'
    );
  };

  const [showNewChallenge, setShowNewChallenge] = useState(false);

  const handlePlayerClick = (player: any) => {
    feedback();
    addNotification(
      player.name,
      player.isMe ? "That's you! You're dominating the league." : `${player.name} is a high-performer in your league with ${player.xp} XP.`,
      'info'
    );
  };
  
  const data = fitData || MOCK_DATA.stats;
  const xpProgress = (user.xp / 1000) * 100; // Assuming 1000 XP per level

  const BADGES_CONFIG = [
    { id: 's5', name: '5K Master', icon: '🚶', desc: 'Reach 5,000 steps in a day', condition: (d: any) => d.stepsToday >= 5000 },
    { id: 's10', name: '10K King', icon: '🦶', desc: 'Reach 10,000 steps in a day', condition: (d: any) => d.stepsToday >= 10000 },
    { id: 's20', name: '20K Elite', icon: '🏁', desc: 'Reach 20,000 steps in a day', condition: (d: any) => d.stepsToday >= 20000 },
    { id: 'sl', name: 'Sleep Hero', icon: '💤', desc: '3+ days sleep streak', condition: (d: any) => d.streakDays >= 3 },
    { id: 'hp', name: 'Heart God', icon: '❤️', desc: 'Peak HR above 140 BPM', condition: (d: any) => d.bpmMax >= 140 },
    { id: 'ac', name: 'Active Hub', icon: '🔥', desc: '7 days of consistency', condition: (d: any) => d.streakDays >= 7 },
    { id: 'mg', name: 'Goal Setter', icon: '🎯', desc: 'Daily step goal reached', condition: (d: any) => d.stepsToday >= d.stepsGoal },
    { id: 'eb', name: 'Early Bird', icon: '🌅', desc: 'Workout logged before 7 AM', condition: (d: any) => true },
    { id: 'im', name: 'Iron King', icon: '💪', desc: 'Lifted 500kg total', condition: (d: any) => true },
    { id: 'wg', name: 'Water God', icon: '💧', desc: 'Logged hydration 5 days', condition: (d: any) => true },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Progress Board</h2>
          <p className="text-sm text-gray-500">Level {user.level} Elite</p>
        </div>
        <div className="flex bg-[#1a1a1a] rounded-2xl p-1 border border-white/5">
          {[
            { id: 'progress', icon: Target },
            { id: 'leaderboard', icon: Users },
            { id: 'badges', icon: Award }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id as any)}
              className={`p-2.5 rounded-xl transition-all ${activeView === v.id ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20' : 'text-gray-500 hover:text-white'}`}
            >
              <v.icon size={18} />
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeView === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Level & XP Summary */}
            <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-[#6C63FF] uppercase font-black tracking-widest">Global Rank</p>
                  <p className="text-3xl font-black italic">TOP 2%</p>
                </div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl relative">
                  <Medal size={24} className="text-yellow-500" />
                  <div className="absolute -top-2 -right-2 bg-[#6C63FF] w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#1a1a1a]">
                    {user.level}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.xp} / 1000 XP</p>
                  <p className="text-[10px] text-[#6C63FF] font-bold">NEXT LEVEL: 550 XP</p>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B] shadow-[0_0_10px_rgba(108,99,255,0.4)]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex-1 bg-black/20 p-3 rounded-2xl border border-white/5 flex items-center space-x-3">
                  <Flame size={16} className="text-orange-500" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Streak</p>
                    <p className="text-sm font-black">7 DAYS</p>
                  </div>
                </div>
                <div className="flex-1 bg-black/20 p-3 rounded-2xl border border-white/5 flex items-center space-x-3">
                  <Medal size={16} className="text-indigo-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Points</p>
                    <p className="text-sm font-black">{user.points}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Friend Challenges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Friend Challenges</h3>
                <button 
                  onClick={() => setShowNewChallenge(true)}
                  className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest flex items-center space-x-1"
                >
                  <Users size={12} className="mr-1" />
                  <span>Start New</span>
                </button>
              </div>
              <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <img src="https://i.pravatar.cc/150?u=maria" className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]" alt="Friend" />
                      <div className="w-8 h-8 rounded-full bg-[#6C63FF] border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold">VS</div>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase">Steps Duel</p>
                      <p className="text-[9px] text-gray-500 font-bold">Ends in 4h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#6C63FF]">4,230 / 5,000</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase">Leading by 200</p>
                  </div>
                </div>
                <div className="p-4 bg-[#6C63FF]/5 flex items-center justify-center space-x-6">
                  {['🔥', '👏', '🚀'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => handleEmojiReact(emoji)}
                      className="group flex flex-col items-center space-y-1"
                    >
                      <span className="text-lg group-active:scale-125 transition-transform">{emoji}</span>
                      <span className="text-[8px] font-black text-gray-600">{reactions[emoji]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Challenges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Active Challenges</h3>
                <button className="text-[10px] font-black text-[#6C63FF] uppercase flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {CHALLENGES.map((c) => (
                  <div key={c.id}>
                    <ChallengeCard challenge={c} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-gradient-to-br from-[#6C63FF]/10 to-transparent">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#6C63FF] mb-1">Mirror League 🏆</h3>
                <p className="text-[10px] text-gray-500 font-bold italic uppercase">Resets in 2d 14h</p>
              </div>
              <div className="divide-y divide-white/5">
                {LEADERBOARD_DATA.map((player) => (
                  <button 
                    key={player.name} 
                    onClick={() => handlePlayerClick(player)}
                    className={`w-full flex items-center justify-between p-5 transition-colors ${player.isMe ? 'bg-[#6C63FF]/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 flex items-center justify-center font-black ${player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-slate-400' : player.rank === 3 ? 'text-amber-700' : 'text-gray-600'}`}>
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                      </div>
                      <img src={player.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                      <div>
                        <p className={`text-xs font-black ${player.isMe ? 'text-[#6C63FF]' : 'text-white'}`}>{player.name}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter italic">Consistent King</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black italic">{player.xp.toLocaleString()} XP</p>
                      <p className="text-[9px] text-[#4CAF50] font-black">▲ 2 Spots</p>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  feedback();
                  addNotification(
                    'Leaderboard',
                    'Full rank list is loading... You are currently #3 in the Mirror League.',
                    'info'
                  );
                }}
                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase hover:text-white transition-colors border-t border-white/5"
              >
                View Full Leaderboard
              </button>
            </div>

            <div className="bg-[#6C63FF] p-6 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-[#6C63FF]/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase">Friend Referral</h4>
                  <p className="text-[10px] opacity-80">Invite friends to unlock the "Legion" badge!</p>
                </div>
              </div>
              <button className="w-full bg-white text-[#6C63FF] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                Send Invite Link
              </button>
            </div>
          </motion.div>
        )}

        {activeView === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-4">
              {BADGES_CONFIG.map((badge) => {
                const isUnlocked = badge.condition(data);
                return (
                  <motion.button
                    key={badge.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBadge(badge)}
                    className={`aspect-square rounded-3xl p-4 flex flex-col items-center justify-center space-y-2 border transition-all ${
                      isUnlocked 
                        ? 'bg-[#1a1a1a] border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                        : 'bg-[#1a1a1a]/30 border-white/5 opacity-30 grayscale'
                    }`}
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <p className="text-[9px] font-black uppercase leading-tight text-center">{badge.name}</p>
                  </motion.button>
                );
              })}
              <div className="aspect-square rounded-3xl p-4 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-30">
                <Medal size={24} className="text-gray-500" />
                <p className="text-[8px] font-black uppercase text-center mt-2">More Badges Coming Soon</p>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-[#6C63FF]/5 to-transparent">
              <div className="flex items-center space-x-3 mb-4">
                <Trophy size={16} className="text-yellow-500" />
                <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Badge Achievements</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                  <span className="text-gray-500">UNLOCKED</span>
                  <span className="text-white">{BADGES_CONFIG.filter(b => b.condition(data)).length} / 10</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                  <span className="text-gray-500">PERCENTILE</span>
                  <span className="text-yellow-500">TOP 5%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet Modal for Badges */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-[3rem] p-8 pb-12 z-[101] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-inner ${selectedBadge.condition(data) ? 'bg-yellow-500/10' : 'bg-white/5 grayscale opacity-20'}`}>
                  {selectedBadge.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{selectedBadge.name}</h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[250px]">{selectedBadge.desc}</p>
                </div>
                <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedBadge.condition(data) ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                  {selectedBadge.condition(data) ? 'Achievement Unlocked 🏆' : 'Locked 🔒'}
                </div>
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="w-full bg-[#6C63FF] py-5 rounded-[2rem] text-[10px] font-black uppercase shadow-xl shadow-[#6C63FF]/30 active:scale-95 transition-all mt-4"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Challenge Modal */}
      <AnimatePresence>
        {showNewChallenge && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewChallenge(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-[2.5rem] p-8 pb-12 z-[101] border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <h3 className="text-xl font-black uppercase italic tracking-tight mb-6">Create Duel</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Select Friend</p>
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {LEADERBOARD_DATA.filter(p => !p.isMe).map(friend => (
                      <button key={friend.name} className="flex flex-col items-center space-y-2 flex-shrink-0 group">
                        <img src={friend.avatar} className="w-12 h-12 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all" alt={friend.name} />
                        <span className="text-[8px] font-black uppercase text-gray-500 group-hover:text-white transition-colors">{friend.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Challenge Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Step Duel', icon: '🦶', xp: 50 },
                      { label: 'Calorie Race', icon: '🔥', xp: 100 },
                      { label: 'Sleep Streak', icon: '💤', xp: 150 },
                      { label: 'HR Master', icon: '❤️', xp: 80 }
                    ].map(type => (
                      <button key={type.label} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center space-y-2 active:bg-[#6C63FF]/20 active:border-[#6C63FF]/50 transition-all">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-[10px] font-black uppercase">{type.label}</span>
                        <span className="text-[8px] text-[#6C63FF] font-black">{type.xp} XP POT</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    feedback();
                    setShowNewChallenge(false);
                    addNotification('Challenge Sent!', 'Your duel invitation has been broadcasted.', 'success');
                  }}
                  className="w-full bg-[#6C63FF] py-5 rounded-[2rem] text-[10px] font-black uppercase shadow-xl shadow-[#6C63FF]/30 active:scale-95 transition-all mt-4"
                >
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = (challenge.progress / challenge.goal) * 100;
  const Icon = challenge.icon;
  
  return (
    <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-white/5 space-y-4 hover:border-[#6C63FF]/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center text-[#6C63FF]">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">{challenge.title}</p>
            <p className="text-[9px] text-[#4CAF50] font-black uppercase">REWARD: {challenge.reward}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black italic">{challenge.progress}/{challenge.goal}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase italic">Remaining</p>
        </div>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-[#6C63FF]"
        />
      </div>
    </div>
  );
}
