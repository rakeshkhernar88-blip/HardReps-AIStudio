
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
  Check
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Profile Info */}
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="relative group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-[#1a1a1a] shadow-2xl relative"
          >
            <img src={isEditing ? formData.avatar : user.avatar} alt={user.name} className="w-full h-full object-cover" />
            <button 
              onClick={handleAvatarClick}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Camera size={24} />
            </button>
          </motion.div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#6C63FF] rounded-2xl flex items-center justify-center border-4 border-[#0a0a0a] text-white shadow-lg">
            <Settings size={18} />
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
            <span className="text-xs text-gray-500 mb-1">kg</span>
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
          <SettingsItem icon={Target} label="My Goals" sublabel={user.goal} />
          <SettingsItem icon={Bell} label="Notifications" sublabel="Push, Emails" />
          <SettingsItem icon={Shield} label="Privacy & Security" />
          <div className="h-px bg-white/5 mx-6" />
          <button className="w-full px-6 py-5 flex items-center justify-between text-red-500 hover:bg-white/5 transition-colors">
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
