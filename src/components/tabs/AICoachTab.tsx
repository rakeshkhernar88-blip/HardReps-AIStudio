import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Settings, X, Check, MessageSquare, Heart, Flame, Ghost } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MOCK_DATA } from '../../constants';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';
import { getSystemPrompt } from '../../utils/aiUtils';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  isNew?: boolean;
}

const PERSONALITIES = [
  { id: 'friendly', name: 'Friendly', icon: Heart, desc: 'Kind, supportive, and motivating like a best friend.', color: 'text-pink-400' },
  { id: 'aggressive', name: 'Aggressive', icon: Flame, desc: 'Tough love, no excuses, high intensity coaching.', color: 'text-red-400' },
  { id: 'calm', name: 'Calm', icon: Ghost, desc: 'Peaceful, steady, and focused on mindfulness.', color: 'text-blue-400' },
  { id: 'funny', name: 'Funny', icon: MessageSquare, desc: 'Humorous, playful roasting, and witty remarks.', color: 'text-yellow-400' },
];

const Typewriter = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15); // Adjust speed here
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayText}</span>;
};

export default function AICoachTab() {
  const { addNotification } = useNotifications();
  const { user, updateUser, addReminder, toggleReminder } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: `Hey ${user.name}! Aaj 8,432 steps ho gaye hain, solid start hai! 🚀 Aaj ka kya plan hai? Workout ya recovery?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, showSettings]);

  // Periodic scroll check during typing
  useEffect(() => {
    let interval: any;
    if (isTyping || messages.some(m => m.isNew)) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isTyping, messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', text, timestamp };
    setInput('');
    setIsTyping(true);
    
    setMessages(prev => [...prev, userMsg]);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: "Gemini API key is missing. Please add it in the Settings menu.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
        return;
      }

      const stats = MOCK_DATA.stats;
      
      const fitData = {
        steps: stats.stepsToday,
        calories: stats.calories,
        sleep: Math.round(stats.sleep * 60),
        bedtime: MOCK_DATA.sleepData.bedtime,
        wakeTime: MOCK_DATA.sleepData.wakeTime,
        weeklyData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
          name: day,
          steps: MOCK_DATA.weeklySteps[i] || 8000,
          sleep: (7 + (Math.random() * 2)).toFixed(1)
        })),
        activities: MOCK_DATA.workoutHistory.map(w => ({
          date: w.date,
          name: w.name,
          duration: parseInt(w.duration)
        })),
        goals: {
          steps: stats.stepsGoal,
          sleep: 480
        },
        reminders: user.reminders
      };
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Increased history to 20 messages to prevent "ignoring" or context loss
      const sessionHistory = messages.slice(-20).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [...sessionHistory, { role: 'user', parts: [{ text }] }],
        config: { systemInstruction: getSystemPrompt(fitData) }
      });

      const fullText = response.text || "I'm here to help, Rakesh!";
      let plainText = fullText;
      let actionData: any = null;

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          actionData = JSON.parse(jsonMatch[0]);
          plainText = fullText.replace(jsonMatch[0], '').trim();
        } catch (e) {
          console.error("Action Parse Error:", e);
        }
      }

      // Execute Actions
      if (actionData) {
        const { action, params } = actionData;
        if (action === 'SET_REMINDER' && addReminder) {
          addReminder({
            type: params.type || 'custom',
            time: params.time || '10:00 AM',
            message: params.message || `Time for your ${params.type}`,
            enabled: true,
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          });
          addNotification('Coach Action', `Set ${params.type} reminder for ${params.time}`, 'success');
        } else if (action === 'UPDATE_GOAL' && updateUser) {
          // Note: Profile doesn't have a direct goals object, but we update the string for demo
          updateUser({ goal: `${params.field}: ${params.value}` });
          addNotification('Coach Action', `Updated ${params.field} goal to ${params.value}`, 'success');
        } else if (action === 'TOGGLE_SETTING' && toggleReminder) {
          toggleReminder(params.id);
          addNotification('Coach Action', `Updated reminder setting`, 'info');
        }
      }

      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsg: Message = { 
        role: 'ai', 
        text: plainText || "Done!", 
        timestamp: responseTime,
        isNew: true 
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error: any) {
      console.error("AI Coach Error:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Error connecting to AI. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getPersonaInfo = () => {
    const stats = MOCK_DATA.stats;
    if (stats.sleep < 7) return { label: 'Recovery Mode', color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
    if (stats.steps < stats.stepsGoal * 0.6) return { label: 'Beast Mode', color: 'text-red-400', bg: 'bg-red-500/10' };
    return { label: 'Active Mode', color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10' };
  };

  const personaInfo = getPersonaInfo();

  return (
    <div className="flex flex-col h-[calc(100dvh-220px)] sm:h-[calc(100vh-320px)] pb-1 relative">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">HR Coach AI</h2>
            <div className="flex items-center">
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${personaInfo.color.replace('text', 'bg')}`}></div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Live Support</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-2xl border transition-all duration-300 ${showSettings ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30' : 'bg-[#1a1a1a] border-white/5 text-gray-500 hover:text-white hover:border-white/10'}`}
          >
            <Settings size={18} />
          </button>
          <div className={`px-3 py-1.5 rounded-full ${personaInfo.bg} border border-white/5 shadow-sm`}>
            <span className={`text-[9px] font-black uppercase tracking-wider ${personaInfo.color}`}>
              {personaInfo.label}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden flex flex-col bg-[#111] rounded-3xl border border-white/5">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 overflow-y-auto space-y-6 p-5 scrollbar-hide"
            >
              <div className="space-y-4">
                <h3 className="text-[11px] uppercase font-black text-[#6C63FF] tracking-[0.1em] px-1">AI Personality</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PERSONALITIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updateUser({ assistantStyle: p.id as any })}
                      className={`p-4 rounded-3xl border transition-all duration-300 text-left space-y-2 relative overflow-hidden ${
                        user.assistantStyle === p.id 
                          ? 'bg-[#6C63FF]/10 border-[#6C63FF] shadow-inner' 
                          : 'bg-[#1a1a1a] border-white/5 opacity-60 hover:opacity-100 hover:bg-[#222]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p.icon size={22} className={p.color} />
                        {user.assistantStyle === p.id && <div className="bg-[#6C63FF] rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-white tracking-wide">{p.name}</p>
                        <p className="text-[9px] text-gray-500 leading-snug font-medium">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] uppercase font-black text-[#6C63FF] tracking-[0.1em] px-1">Response Templates</h3>
                <div className="space-y-3">
                  {[
                    { id: 'confirmation', label: 'Workout Confirmation', icon: Check },
                    { id: 'automatic', label: 'Time Alert', icon: Bot },
                    { id: 'workout_time', label: 'Workout Start', icon: Flame },
                  ].map((type) => (
                    <div key={type.id} className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 space-y-3 shadow-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="p-1.5 bg-black/40 rounded-lg">
                          <type.icon size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                      </div>
                      <input 
                        type="text"
                        value={(user.assistantMessages as any)[type.id]}
                        onChange={(e) => updateUser({ 
                          assistantMessages: { ...user.assistantMessages, [type.id]: e.target.value } 
                        })}
                        placeholder="Enter custom message..."
                        className="w-full bg-black/60 border border-white/5 rounded-2xl py-3.5 px-5 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-[#6C63FF] py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#6C63FF]/20 active:scale-95 transition-all duration-300 transform"
              >
                Save Preferences
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-5 p-5 pb-24 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      key={i}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end ml-10' : 'items-start mr-10'}`}
                    >
                      <div className={`px-5 py-4 text-[14px] leading-[1.6] shadow-xl ${
                        msg.role === 'user' 
                          ? 'bg-[#6C63FF] text-white rounded-[24px] rounded-br-[6px] font-medium' 
                          : 'bg-[#1a1a1a] text-white/90 border border-white/5 rounded-[24px] rounded-bl-[6px]'
                      }`}>
                        {msg.role === 'ai' && msg.isNew ? (
                          <Typewriter 
                            text={msg.text} 
                            onComplete={() => {
                              setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, isNew: false } : m));
                            }} 
                          />
                        ) : (
                          msg.text
                        )}
                      </div>
                      <span className={`text-[10px] text-gray-500 font-bold mt-2 px-1 tracking-widest uppercase opacity-60`}>
                        {msg.timestamp}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="flex justify-start items-center space-x-3 px-1"
                  >
                    <div className="bg-[#1a1a1a] px-5 py-4 rounded-full flex items-center space-x-1.5 border border-white/5 shadow-inner">
                      {[0, 1, 2].map((i) => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            y: [0, -4, 0],
                            opacity: [0.3, 1, 0.3]
                          }} 
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.6, 
                            delay: i * 0.15, 
                            ease: "easeInOut" 
                          }} 
                          className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full shadow-[0_0_8px_rgba(108,99,255,0.4)]" 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest animate-pulse">Analyzing...</span>
                  </motion.div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none">
                <div className="pointer-events-auto mt-2">
                  <div className="relative group">
                    <input 
                      type="text" 
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isTyping && input.trim()) {
                          handleSend(input);
                        }
                      }}
                      placeholder={isTyping ? "Rakesh, AI Coach is responding..." : "Ask your coach about your progress..."}
                      className={`w-full bg-[#1e1e1e] border rounded-3xl py-4.5 pl-6 pr-16 text-[14px] text-white placeholder-gray-600 transition-all duration-300 outline-none backdrop-blur-sm ${
                        input.trim() 
                          ? 'border-[#6C63FF] ring-4 ring-[#6C63FF]/10 shadow-[0_0_30px_rgba(108,99,255,0.2)]' 
                          : 'border-white/10 focus:border-[#6C63FF]/50'
                      }`}
                    />
                    <button 
                      onClick={() => handleSend(input)}
                      disabled={!input.trim() || isTyping}
                      aria-label="Send message"
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center transition-all duration-300 rounded-[20px] ${
                        input.trim() && !isTyping 
                          ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30 active:scale-90' 
                          : 'bg-white/5 text-gray-700'
                      }`}
                    >
                      <Send size={18} fill={input.trim() && !isTyping ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="mt-2.5 flex justify-center space-x-4">
                    <p className="text-[9px] text-gray-600 font-bold tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5">Voice Command Ready</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
