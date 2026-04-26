/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, Smile, Meh, Frown, Sparkles } from 'lucide-react';

interface Entry {
  id: string;
  date: string;
  text: string;
  mood: string;
}

const moods = [
  { icon: Smile, label: 'Great', color: 'text-[#4CAF50]' },
  { icon: Meh, label: 'Okay', color: 'text-[#6C63FF]' },
  { icon: Frown, label: 'Bad', color: 'text-[#FF6B6B]' },
];

export default function JournalTab() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: '1', date: 'Oct 24, 2023', text: 'Hit a new PR on Deadlift today! Feeling strong.', mood: 'Great' },
    { id: '2', date: 'Oct 23, 2023', text: 'Slightly tired, but the workout was decent.', mood: 'Okay' },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Great');

  const addEntry = () => {
    if (!newText.trim()) return;
    const entry: Entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: newText,
      mood: selectedMood,
    };
    setEntries([entry, ...entries]);
    setNewText('');
    setIsAdding(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fitness Journal</h2>
          <p className="text-sm text-gray-500">Document your journey</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-10 h-10 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center shadow-lg shadow-[#6C63FF]/30 active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-[#6C63FF]/30 space-y-4 mb-4">
              <textarea 
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="How was your workout today?"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#6C63FF] text-white min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                   {moods.map(m => (
                     <button
                        key={m.label}
                        onClick={() => setSelectedMood(m.label)}
                        className={`p-2 rounded-xl border transition-all ${selectedMood === m.label ? 'border-[#6C63FF] bg-[#6C63FF]/10 ' + m.color : 'border-white/5 text-gray-500'}`}
                     >
                        <m.icon size={18} />
                     </button>
                   ))}
                </div>
                <button 
                  onClick={addEntry}
                  disabled={!newText.trim()}
                  className="bg-[#6C63FF] text-white px-6 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {entries.map((entry) => {
          const MoodIcon = moods.find(m => m.label === entry.mood)?.icon || Smile;
          const moodColor = moods.find(m => m.label === entry.mood)?.color || 'text-white';

          return (
            <motion.div 
              layout
              key={entry.id}
              className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 relative group"
            >
              <div className="flex items-start justify-between mb-2">
                 <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg bg-black/40 ${moodColor}`}>
                       <MoodIcon size={14} />
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500">
                       <Calendar size={10} className="mr-1" />
                       {entry.date}
                    </div>
                 </div>
                 <button 
                  onClick={() => deleteEntry(entry.id)}
                  className="text-gray-600 hover:text-[#FF6B6B] transition-colors"
                 >
                    <Trash2 size={14} />
                 </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                {entry.text}
              </p>
            </motion.div>
          );
        })}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 text-[#6C63FF]/30">
               <Sparkles size={32} />
            </div>
            <p className="text-sm text-gray-500">No entries yet. Start recording your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
}
