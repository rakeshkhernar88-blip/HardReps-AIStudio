/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MOCK_DATA } from '../../constants';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';

interface Message {
  role: 'user' | 'ai';
  text: string;
  isNew?: boolean;
}

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
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hey ${user.name}! Aaj 8,432 steps ho gaye hain, solid start hai! 🚀 Aaj ka kya plan hai? Workout ya recovery?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getDynamicPrompts = () => {
    const lastWorkout = MOCK_DATA.workoutHistory[0];
    const prompts = [
      "Today's workout plan",
    ];

    if (lastWorkout) {
      prompts.push(`Recovery for ${lastWorkout.name}`);
      prompts.push("How was my form?");
    } else {
      prompts.push("Recovery advice");
      prompts.push("Form check tips");
    }

    if (MOCK_DATA.stats.steps < MOCK_DATA.stats.stepsGoal) {
      prompts.push("Finish my step goal");
    }

    return prompts;
  };

  const dynamicPrompts = getDynamicPrompts();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

    const userMsg: Message = { role: 'user', text };
    setInput('');
    setIsTyping(true);
    
    setMessages(prev => [...prev, userMsg]);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'ai', text: "Gemini API key is missing. Please add it in the Settings menu (developer key is required for AI Coach)." }]);
        setIsTyping(false);
        return;
      }

      const stats = MOCK_DATA.stats;
      const lastWorkout = MOCK_DATA.workoutHistory[0];
      
      const moods = ["Professional Trainer", "Humorous Friend (Playful roasting allowed)", "Strict Disciplinarian", "Empathic Supporter"];
      const currentMood = moods[Math.floor(Math.random() * moods.length)];

      const context = `
        USER PROFILE:
        - Name: ${user.name}
        - Weight: ${user.weight}kg
        - Height: ${user.height}cm
        - Main Goal: ${user.goal}
        
        USER STATS (Real-time data):
        - Steps Today: ${stats.stepsToday} (Goal: ${stats.stepsGoal})
        - Calories Burned Today: ${stats.calories} kcal
        - Sleep Quality: ${stats.sleepHours}h last night (Target: 8h)
        - Current Heart Rate: ${stats.heartRate} BPM (Max today: ${stats.bpmMax})
        - Training Streak: ${stats.streakDays} days
        - Last Active Session: ${stats.lastWorkout}
        - Recovery Status: ${stats.sleepHours < 7 ? 'RECOVERY MODE (Sleep low)' : 'NORMAL'}

        ${lastWorkout ? `SESSION HISTORY: Last session was "${lastWorkout.name}" (${lastWorkout.duration}), Burning ${lastWorkout.calories} kcal.` : 'SESSION HISTORY: No workouts recorded today.'}
        
        AI CURRENT MOOD: ${currentMood}
      `.trim();

      const ai = new GoogleGenAI({ apiKey });
      
      const fullHistory = [...messages, userMsg];
      const modelHistory = fullHistory
        .filter((msg, idx) => !(idx === 0 && msg.role === 'ai'))
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const finalContents = modelHistory.length > 0 ? modelHistory : [{ role: 'user', parts: [{ text }] }];

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: finalContents,
        config: {
          systemInstruction: `# ROLE: HardReps AI Coach (Nickname: Bunny)
# TARGET USER: ${user.name}

# CONTEXT & DATA ACCESS:
You have real-time access to the user's fitness ecosystem. Always reference the following data naturally in conversation:
${context}

# PERSONALITY & TONE:
1. FRIENDLY & HUMAN: Baat aise karo jaise ek purana dost ya personal coach kar raha ho. Use "Hinglish" (Hindi + English) for a natural Indian vibe. 
2. NO REPETITION: Kabhi bhi ek hi info baar-baar repeat mat karo. Agar steps ek baar bata diye, toh agli baar "calories" ya "sleep" par focus karo.
3. TOUGH BUT SUPPORTIVE: User ko push karo jab wo lazy ho (steps low), lekin recovery mode mein empathetic raho (sleep low). Respect the AI CURRENT MOOD if steps/sleep are normal.
4. DATA-DRIVEN INSIGHTS: Sirf numbers mat batao, unka matlab samjhao. 
   - Good Example: "${user.name}, 8000 steps done! Aaj ka cardio solid hai, ab protein pe dhyan de muscle recovery ke liye."

# OPERATIONAL RULES:
- Address him as "${user.name}" always.
- Keep responses short, direct, and conversational (Max 60 words).
- Accuracy: Answer profile questions (weight, height, goal) with 100% accuracy using the data provided in the context.
- Proactive Coaching: Suggest the next best action (e.g., "Paani pee le," "Ab so ja," "Kal leg day hai taiyar reh").
- No "As an AI" phrases.`,
        }
      });

      const aiMsg: Message = { role: 'ai', text: response.text || "I'm having trouble connecting right now, but keep grinding!", isNew: true };
      setMessages(prev => [...prev, aiMsg]);
      
      // Also add to global notifications
      addNotification('AI Coach Tip', response.text || "New advice from your coach!", 'info');
    } catch (error: any) {
      console.error("AI Coach Error:", error);
      const isAuthError = error?.toString().includes("403") || error?.toString().includes("permission");
      const errorMsg = isAuthError 
        ? "Access Denied (403): Your API key may not have access to this model or the Generative AI API is disabled. Please check your AI Studio settings."
        : "Error connecting to AI. Please try again later.";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
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
    <div className="flex flex-col h-[calc(100vh-350px)] sm:h-[calc(100vh-380px)] pb-2 relative">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">HR Coach AI</h2>
            <div className="flex items-center">
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${personaInfo.color.replace('text', 'bg')}`}></div>
              <p className="text-[10px] text-gray-500">Always active</p>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${personaInfo.bg} border border-white/5`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${personaInfo.color}`}>
            {personaInfo.label}
          </span>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide px-0.5"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#6C63FF] text-white rounded-tr-none' 
                  : 'bg-[#1a1a1a] text-gray-200 border border-white/10 rounded-tl-none'
              }`}>
                {msg.role === 'ai' && msg.isNew ? (
                  <Typewriter 
                    text={msg.text} 
                    onComplete={() => {
                      // Update messages to set isNew to false after animation
                      setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, isNew: false } : m));
                    }} 
                  />
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex justify-start"
          >
            <div className="bg-[#1a1a1a] p-3 rounded-2xl rounded-tl-none flex space-x-1 border border-white/5">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-gray-500 rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-gray-500 rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-gray-500 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-3 pt-4 bg-[#0a0a0a] shrink-0 border-t border-white/5">
        <AnimatePresence>
          {!isTyping && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex overflow-x-auto gap-2 pb-2 no-scrollbar px-1"
            >
              {dynamicPrompts.map((p) => (
                <button 
                  key={p}
                  disabled={isTyping}
                  onClick={() => handleSend(p)}
                  className="text-[10px] bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-[#6C63FF]/20 hover:border-[#6C63FF]/30 transition-all flex items-center whitespace-nowrap shrink-0 disabled:opacity-50 active:scale-95 shadow-sm"
                >
                  <Sparkles size={10} className="mr-1.5 text-[#6C63FF]" />
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative pb-2">
          <input 
            type="text" 
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isTyping) {
                handleSend(input);
              }
            }}
            placeholder={isTyping ? "AI is thinking..." : "Ask anything..."}
            className={`w-full bg-[#1a1a1a] border rounded-2xl py-4 pl-4 pr-12 text-sm text-white placeholder-gray-500 transition-all outline-none ${
              input.trim() 
                ? 'border-[#6C63FF]/50 ring-1 ring-[#6C63FF]/20 shadow-[0_0_15px_rgba(108,99,255,0.1)]' 
                : 'border-white/10 focus:ring-1 focus:ring-[#6C63FF]/50'
            }`}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-[calc(50%-4px)] -translate-y-1/2 w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-30 disabled:bg-gray-700"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
