
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Weight, 
  Ruler, 
  Target, 
  FileText, 
  LogOut, 
  ChevronRight,
  Settings,
  Shield,
  Bell,
  Check,
  Trophy,
  Dumbbell,
  Activity
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { feedback } from '../../lib/haptics';

export default function ProfileTab() {
  const { user, updateUser } = useUser();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    addNotification('Profile Updated', 'Your details have been saved successfully.', 'success');
  };

  const toggleUnit = () => {
    const newUnit = user.unit === 'kg' ? 'lbs' : 'kg';
    updateUser({ unit: newUnit });
    addNotification('Unit Changed', `Preferences updated to ${newUnit}.`, 'success');
  };

  const togglePublic = () => {
    updateUser({ isPublic: !user.isPublic });
    addNotification('Privacy Updated', `Profile is now ${!user.isPublic ? 'Public' : 'Private'}.`, 'success');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Update both to ensure immediate feedback and persistence
        updateUser({ avatar: result });
        setFormData(prev => ({ ...prev, avatar: result }));
        addNotification('Avatar Updated', 'Your profile picture has been updated.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Profile Info */}
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-[#1a1a1a] shadow-2xl relative"
          >
            <img src={isEditing ? formData.avatar : user.avatar} alt={user.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera size={24} />
            </div>
          </motion.div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#6C63FF] rounded-2xl flex items-center justify-center border-4 border-[#0a0a0a] text-white shadow-lg pointer-events-none">
            <Camera size={18} />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-500 text-sm">Member since Oct 2023</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {!isEditing ? (
          <button 
            onClick={handleEditToggle}
            className="flex-1 bg-[#1a1a1a] border border-white/5 py-4 rounded-3xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
          >
            <User size={18} className="text-[#6C63FF]" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex w-full space-x-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-[#1a1a1a] border border-white/5 py-4 rounded-3xl font-bold flex items-center justify-center text-gray-400 active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] bg-[#6C63FF] py-4 rounded-3xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
              <Check size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-gray-500">
            <Weight size={14} />
            <span className="text-[10px] uppercase tracking-wider font-bold">Weight</span>
          </div>
          <div className="flex items-end space-x-1">
            <span className="text-2xl font-bold">{user.weight}</span>
            <span className="text-xs text-gray-500 mb-1">{user.unit}</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-gray-500">
            <Ruler size={14} />
            <span className="text-[10px] uppercase tracking-wider font-bold">Height</span>
          </div>
          <div className="flex items-end space-x-1">
            <span className="text-2xl font-bold">{user.height}</span>
            <span className="text-xs text-gray-500 mb-1">cm</span>
          </div>
        </div>
      </div>

      {/* Personal Bests Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-[#6C63FF]">Personal Bests (PRs)</h3>
          {!isEditing && <Trophy size={14} className="text-yellow-500" />}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <PRCard 
            icon={Dumbbell} 
            label="Bench Press" 
            value={isEditing ? formData.personalBests.bench : user.personalBests.bench} 
            isEditing={isEditing}
            onChange={(val) => setFormData({
              ...formData, 
              personalBests: { ...formData.personalBests, bench: val }
            })}
          />
          <PRCard 
            icon={Activity} 
            label="Squat" 
            value={isEditing ? formData.personalBests.squat : user.personalBests.squat} 
            isEditing={isEditing}
            onChange={(val) => setFormData({
              ...formData, 
              personalBests: { ...formData.personalBests, squat: val }
            })}
          />
          <PRCard 
            icon={Activity} 
            label="Deadlift" 
            value={isEditing ? formData.personalBests.deadlift : user.personalBests.deadlift} 
            isEditing={isEditing}
            onChange={(val) => setFormData({
              ...formData, 
              personalBests: { ...formData.personalBests, deadlift: val }
            })}
          />
          <PRCard 
            icon={Dumbbell} 
            label="Overhead" 
            value={isEditing ? formData.personalBests.overhead : user.personalBests.overhead} 
            isEditing={isEditing}
            onChange={(val) => setFormData({
              ...formData, 
              personalBests: { ...formData.personalBests, overhead: val }
            })}
          />
        </div>
      </div>

      {/* Editing Form / Details */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 bg-[#1a1a1a]/50 p-6 rounded-[2.5rem] border border-white/5"
          >
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-4">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                placeholder="Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-4">Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-4">Height (cm)</label>
                <input 
                  type="number" 
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-4">My Goal</label>
              <select 
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 transition-colors appearance-none"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Endurance">Endurance</option>
                <option value="General Fitness">General Fitness</option>
                <option value="Strength">Strength</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-4">Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#6C63FF]/50 transition-colors resize-none"
                placeholder="A bit about you..."
              />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <div className="bg-[#1a1a1a]/30 p-8 rounded-[2.5rem] border border-white/5">
              <div className="flex items-center space-x-3 mb-4 text-gray-400">
                <FileText size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">About Me</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{user.bio}"
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings List */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-4">Preferences</h3>
        <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden">
          <SettingsToggle 
            icon={Activity} 
            label="Weight Units" 
            sublabel={`Current: ${user.unit.toUpperCase()}`}
            active={user.unit === 'lbs'}
            onToggle={toggleUnit}
          />
          <SettingsToggle 
            icon={Shield} 
            label="Public Profile" 
            sublabel="Visible to other users"
            active={user.isPublic}
            onToggle={togglePublic}
          />
          <SettingsItem icon={Target} label="My Goals" sublabel={user.goal} />
          <SettingsItem icon={Bell} label="Notifications" sublabel="Push, Emails" />
          <div className="h-px bg-white/5 mx-6" />
          <button 
            onClick={() => {
              feedback();
              addNotification(
                'Sign Out',
                'In this prototype, signing out is restricted to keep your local data safe.',
                'info'
              );
            }}
            className="w-full px-6 py-5 flex items-center justify-between text-red-500 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold">Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, sublabel }: { icon: any, label: string, sublabel?: string }) {
  return (
    <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-white/5 rounded-xl text-gray-400 group-hover:text-white transition-colors">
          <Icon size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">{label}</span>
          {sublabel && <span className="text-[10px] text-gray-500">{sublabel}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-600" />
    </button>
  );
}

function SettingsToggle({ icon: Icon, label, sublabel, active, onToggle }: { 
  icon: any, 
  label: string, 
  sublabel?: string, 
  active: boolean,
  onToggle: () => void
}) {
  return (
    <div className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-white/5 rounded-xl text-gray-400 group-hover:text-white transition-colors">
          <Icon size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">{label}</span>
          {sublabel && <span className="text-[10px] text-gray-500">{sublabel}</span>}
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-[#6C63FF]' : 'bg-white/10'}`}
      >
        <motion.div 
          animate={{ x: active ? 26 : 2 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

function PRCard({ icon: Icon, label, value, isEditing, onChange }: { 
  icon: any, 
  label: string, 
  value: number, 
  isEditing: boolean,
  onChange: (val: number) => void 
}) {
  const { user } = useUser();
  return (
    <div className="bg-[#1a1a1a] p-5 rounded-[2rem] border border-white/5 space-y-3">
      <div className="flex items-center space-x-2 text-gray-500">
        <Icon size={14} />
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      {isEditing ? (
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-3 text-lg font-bold text-white focus:outline-none focus:border-[#6C63FF]/50"
        />
      ) : (
        <div className="flex items-end space-x-1">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-gray-500 mb-1">{user.unit}</span>
        </div>
      )}
    </div>
  );
}
