
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Trash2, 
  Plus, 
  Clock, 
  ChevronLeft, 
  CheckCircle2, 
  Droplet, 
  Moon, 
  Coffee, 
  Zap,
  Activity,
  ChevronRight,
  Settings,
  Circle
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { feedback } from '../../lib/haptics';
import AnalogueClock from '../ui/AnalogueClock';

const REMINDER_TYPES = [
  { id: 'water', label: 'Hydration', icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'protein', label: 'Protein/Meal', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'sleep', label: 'Sleep Prep', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'move', label: 'Daily Move', icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
  { id: 'custom', label: 'Custom', icon: Bell, color: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]/10' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RemindersTab({ onBack }: { onBack: () => void }) {
  const { user, toggleReminder, deleteReminder, addReminder, updateReminder } = useUser();
  const { addNotification } = useNotifications();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAnalogue, setShowAnalogue] = useState(false);

  const [formData, setFormData] = useState({
    type: 'custom' as any,
    time: '10:00 AM',
    message: '',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  const handleToggle = (id: string) => {
    feedback();
    toggleReminder(id);
    const rem = user.reminders.find(r => r.id === id);
    if (rem) {
      addNotification(
        rem.enabled ? 'Reminder Disabled' : 'Reminder Enabled',
        `${rem.type.toUpperCase()} alert is now ${rem.enabled ? 'OFF' : 'ON'}`,
        'info'
      );
    }
  };

  const handleSave = () => {
    feedback();
    if (editingId) {
      updateReminder(editingId, formData);
      addNotification('Reminder Updated', 'Changes saved successfully', 'success');
    } else {
      addReminder({ ...formData, enabled: true });
      addNotification('Reminder Added', 'New smart reminder set!', 'success');
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    feedback();
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder(id);
      addNotification('Reminder Deleted', 'Reminder has been removed', 'info');
    }
  };

  const openEdit = (rem: any) => {
    setEditingId(rem.id);
    setFormData({
      type: rem.type,
      time: rem.time,
      message: rem.message,
      days: [...rem.days],
    });
    setIsAdding(true);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setShowAnalogue(false);
    setFormData({
      type: 'custom',
      time: '10:00 AM',
      message: '',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    });
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Smart Reminders</h2>
            <p className="text-gray-500 text-sm">Your fitness, on schedule.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#6C63FF] p-3 rounded-2xl text-white shadow-lg shadow-[#6C63FF]/30 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Reminder List */}
      <div className="space-y-4">
        {user.reminders.length === 0 ? (
          <div className="text-center py-12 px-6 bg-[#1a1a1a] rounded-[2.5rem] border border-dashed border-white/10">
            <Bell size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-white font-bold">No Reminders Set</h3>
            <p className="text-gray-500 text-xs mt-2">Add a reminder for hydration, rest, or meals.</p>
          </div>
        ) : (
          user.reminders.map((rem) => {
            const typeConfig = REMINDER_TYPES.find(t => t.id === rem.type) || REMINDER_TYPES[4];
            const Icon = typeConfig.icon;
            
            return (
              <motion.div 
                layout
                key={rem.id}
                className={`bg-[#1a1a1a] p-5 rounded-[2.5rem] border transition-all ${rem.enabled ? 'border-white/10' : 'border-white/5 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${typeConfig.bg} ${typeConfig.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{rem.message || typeConfig.label}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{rem.time} • {rem.days.length === 7 ? 'Everyday' : rem.days.join(', ')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggle(rem.id)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${rem.enabled ? 'bg-success' : 'bg-white/5'}`}
                  >
                     <motion.div 
                       animate={{ x: rem.enabled ? 26 : 4 }}
                       className="absolute top-1 w-4 h-4 bg-white rounded-full"
                     />
                  </button>
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  <button 
                    onClick={() => openEdit(rem)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <Settings size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rem.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-[400px] bg-[#0f0f0f] rounded-t-[3rem] p-8 relative z-10 border-t border-white/10 shadow-2xl h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black italic tracking-tighter uppercase">{editingId ? 'Edit Reminder' : 'New Reminder'}</h3>
                <button onClick={closeForm} className="text-gray-500 hover:text-white">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Type Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-[#6C63FF] tracking-widest px-1">Reminder Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {REMINDER_TYPES.map(type => (
                      <button 
                        key={type.id}
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        className={`p-4 rounded-3xl flex flex-col items-center space-y-2 border transition-all ${
                          formData.type === type.id ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] border-white/5 text-gray-500'
                        }`}
                      >
                        <type.icon size={20} />
                        <span className="text-[9px] font-bold uppercase">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-[#6C63FF] tracking-widest">What time?</label>
                    <button 
                      onClick={() => setShowAnalogue(!showAnalogue)}
                      className="text-[9px] font-black uppercase text-gray-500 hover:text-[#6C63FF] transition-colors"
                    >
                      {showAnalogue ? 'Switch to Digital' : 'Switch to Analogue'}
                    </button>
                  </div>
                  
                  {showAnalogue ? (
                    <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5">
                      <AnalogueClock 
                        initialTime={formData.time} 
                        onChange={(time) => setFormData({ ...formData, time })} 
                      />
                    </div>
                  ) : (
                    <div className="bg-[#1a1a1a] p-4 rounded-[2rem] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/5 p-2 rounded-xl text-gray-400">
                          <Clock size={18} />
                        </div>
                        <input 
                          type="time" 
                          className="bg-transparent text-white font-bold outline-none [color-scheme:dark]"
                          value={formData.time.includes(':') ? (formData.time.includes('AM') || formData.time.includes('PM') ? (function(){
                            const [t, p] = formData.time.split(' ');
                            let [h, m] = t.split(':');
                            if (p === 'PM' && h !== '12') h = (parseInt(h) + 12).toString();
                            if (p === 'AM' && h === '12') h = '00';
                            return `${h.padStart(2, '0')}:${m}`;
                          })() : formData.time ) : '10:00'}
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(':');
                            const hours = parseInt(h);
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const displayH = ((hours + 11) % 12 + 1);
                            setFormData({ ...formData, time: `${displayH}:${m} ${period}` });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-[#6C63FF] tracking-widest px-1">Message</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={`e.g. Time for ${formData.type}...`}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:border-[#6C63FF]/50 transition-colors h-24 resize-none outline-none"
                  />
                </div>

                {/* Daily Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-[#6C63FF] tracking-widest px-1">Active Days</label>
                  <div className="flex justify-between">
                    {DAYS.map(day => (
                      <button 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all border ${
                          formData.days.includes(day) ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'bg-[#1a1a1a] border-white/5 text-gray-500'
                        }`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button 
                    onClick={closeForm}
                    className="flex-1 bg-white/5 py-5 rounded-3xl text-[10px] font-black uppercase text-gray-400"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-[2] bg-[#6C63FF] py-5 rounded-3xl text-[10px] font-black uppercase text-white shadow-xl shadow-[#6C63FF]/30"
                  >
                    {editingId ? 'Update Reminder' : 'Set Reminder'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
