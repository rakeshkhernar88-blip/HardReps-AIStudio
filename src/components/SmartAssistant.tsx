/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, X, Clock, Zap, Flame, CheckCircle2, ChevronRight, 
  TrendingUp, Plus, Minus, Search, Calendar, ChevronLeft, 
  Settings, User, Trash2, Edit3, Target, Dumbbell, 
  Activity, Smile, Meh, Frown
} from 'lucide-react';
import { MOCK_DATA } from '../constants';
import confetti from 'canvas-confetti';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';

interface ExerciseDetail {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | string;
}

interface SmartReminder {
  id: string;
  timeOffset: number; // minutes before workout (or absolute hour for confirmation)
  timeUnit: 'min' | 'hour' | 'absolute'; 
  message: string;
  enabled: boolean;
  type: 'manual' | 'confirmation' | 'automatic' | 'workout_time';
}

interface WorkoutPlan {
  id: string;
  name: string;
  day: string;
  time: string;
  duration: string;
  type: string[];
  muscleGroups: string[];
  energyLevel: number;
  goal: string;
  exercises: ExerciseDetail[];
  reminders: SmartReminder[];
  motivationStyle: string;
  confirmationEnabled: boolean;
}

const MUSCLE_CHIPS = ['Chest', 'Back', 'Bicep', 'Tricep', 'Shoulders', 'Legs', 'Core', 'Glutes', 'Forearms'];
const WORKOUT_TYPES = [
  { id: 'strength', label: 'Strength', icon: '🏋️' },
  { id: 'cardio', label: 'Cardio', icon: '🏃' },
  { id: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { id: 'hiit', label: 'HIIT', icon: '🔥' },
  { id: 'upperBody', label: 'Upper Body', icon: '💪' },
  { id: 'lowerBody', label: 'Lower Body', icon: '🦵' },
  { id: 'fullBody', label: 'Full Body', icon: '🏊' },
  { id: 'rest', label: 'Rest Day', icon: '😴' },
];

const MOTIVATION_STYLES = [
  { id: 'aggressive', label: 'Aggressive', icon: '💪', preview: 'UTHH RAKESH! WORKOUT TIME! 💀' },
  { id: 'friendly', label: 'Friendly', icon: '😊', preview: 'Good morning! Workout time aa gaya 😊' },
  { id: 'calm', label: 'Calm', icon: '🧘', preview: 'Aaj bhi ek step aage badhne ka din 🌅' },
  { id: 'funny', label: 'Funny', icon: '🤣', preview: 'Bhai neend puri ho gayi? Ab pump karo 😂' },
];

export default function SmartAssistant() {
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<WorkoutPlan[]>([
    {
      id: 's1',
      name: 'Push Day',
      day: 'Tomorrow',
      time: '6:00 AM',
      duration: '45 min',
      type: ['Strength'],
      muscleGroups: ['Chest', 'Shoulders', 'Tricep'],
      energyLevel: 7,
      goal: 'Build Muscle',
      reminders: [
        { id: 'r1', type: 'confirmation', timeOffset: 60, timeUnit: 'min', message: 'Kal ka workout ready hai?', enabled: true },
        { id: 'r2', type: 'automatic', timeOffset: 60, timeUnit: 'min', message: '1 ghante mein workout!', enabled: true },
        { id: 'r3', type: 'workout_time', timeOffset: 0, timeUnit: 'min', message: 'WORKOUT START!', enabled: true },
      ],
      motivationStyle: 'friendly',
      confirmationEnabled: true,
      exercises: [
        { id: 'e1', name: 'Bench Press', sets: 4, reps: 10, weight: 80 },
        { id: 'e2', name: 'Shoulder Press', sets: 3, reps: 12, weight: 50 },
      ]
    },
    {
      id: 's2',
      name: 'Leg Day',
      day: 'Day after',
      time: '7:00 AM',
      duration: '60 min',
      type: ['Strength', 'Lower Body'],
      muscleGroups: ['Legs'],
      energyLevel: 8,
      goal: 'Build Muscle',
      reminders: [
        { id: 'r4', type: 'confirmation', timeOffset: 60, timeUnit: 'min', message: 'READY FOR LEGS? 💀', enabled: true },
        { id: 'r5', type: 'automatic', timeOffset: 30, timeUnit: 'min', message: 'Leg day in 30 min!', enabled: true },
      ],
      motivationStyle: 'aggressive',
      confirmationEnabled: true,
      exercises: [
        { id: 'e3', name: 'Squats', sets: 4, reps: 12, weight: 120 },
      ]
    }
  ]);

  const [draft, setDraft] = useState<Partial<WorkoutPlan>>({
    name: 'New Workout',
    day: 'Tomorrow',
    time: '6:00 AM',
    energyLevel: 5,
    goal: 'Build Muscle',
    exercises: [
      { id: 'd1', name: 'Bench Press', sets: 4, reps: 10, weight: 80 },
      { id: 'd2', name: 'Shoulder Press', sets: 3, reps: 12, weight: 50 },
    ],
    reminders: [
      { id: 'rem-conf', type: 'confirmation', timeOffset: 60, timeUnit: 'min', message: 'Kal ka workout ready hai?', enabled: true },
      { id: 'rem-1h', type: 'automatic', timeOffset: 60, timeUnit: 'min', message: '1 ghante mein workout!', enabled: true },
      { id: 'rem-15m', type: 'automatic', timeOffset: 15, timeUnit: 'min', message: '15 min mein GYM TIME!', enabled: true },
      { id: 'rem-now', type: 'workout_time', timeOffset: 0, timeUnit: 'min', message: 'WORKOUT START KARO RAKESH!', enabled: true },
    ],
    motivationStyle: 'friendly',
    confirmationEnabled: true
  });

  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customValue, setCustomValue] = useState(45);
  const [customUnit, setCustomUnit] = useState<'min' | 'hour'>('min');

  const [styleTemplates, setStyleTemplates] = useState({
    aggressive: {
      confirmation: `{name} READY HAI TU? KAL GYM HAI! 💀`,
      automatic: "UTHH JA BHAI! {time} baj gaye! 👺",
      workout_time: "GYM PAHUNCH! START KAR ABHI! 🏋️‍♂️"
    },
    friendly: {
      confirmation: "Heyy! Kal workout hai, ready ho jao 😊",
      automatic: "Bas {offset} bache hain! Taiyar ho? 🥤",
      workout_time: "Time to sweat! Chalo shuru karte hain ✨"
    },
    calm: {
      confirmation: "Kal subah workout scheduled hai, taiyar rehna 🌅",
      automatic: "Ek shaant workout ke liye taiyar ho jao. {offset} left.",
      workout_time: "Chalo, focus shuru karte hain. 🧘"
    },
    funny: {
      confirmation: "Bhai kal gym hai, ya phir excuse ready hai? 😂",
      automatic: "Oi! Aalsi insaan, {offset} mein gym! 🛌",
      workout_time: "Chalo ab, sharam karo aur start karo! 🤡"
    }
  });

  const [isEditingTemplates, setIsEditingTemplates] = useState(false);

  const [editingEx, setEditingEx] = useState<ExerciseDetail | null>(null);

  const getSuggestedWorkout = (): WorkoutPlan => {
    const sleep = MOCK_DATA.stats.sleepHours || MOCK_DATA.stats.sleep;
    const steps = MOCK_DATA.stats.stepsToday || MOCK_DATA.stats.steps;
    const heartRate = (MOCK_DATA.stats as any).heartRate || 72;

    if (sleep < 6 || heartRate > 85) {
      return {
        id: '',
        day: 'Tomorrow',
        time: '7:00 AM',
        duration: '15 min',
        name: 'Full Recovery',
        type: ['Flexibility'],
        muscleGroups: [],
        energyLevel: 2,
        goal: 'De-stress',
        reminders: [
          { id: 'rc1', type: 'workout_time', timeOffset: 0, timeUnit: 'min', message: 'Recovery time!', enabled: true },
        ],
        motivationStyle: 'calm',
        confirmationEnabled: false,
        exercises: [
          { id: 'ex-1', name: 'Deep Breathing', sets: 1, reps: 5, weight: 'BW' },
          { id: 'ex-2', name: 'Child\'s Pose', sets: 3, reps: 60, weight: 'BW' },
        ]
      };
    } else if (sleep < 7) {
      return {
        id: '',
        day: 'Tomorrow',
        time: '6:30 AM',
        duration: '20 min',
        name: 'Recovery + Stretching',
        type: ['Flexibility'],
        muscleGroups: [],
        energyLevel: 4,
        goal: 'Boost Energy',
        reminders: [
          { id: 'rc2', type: 'automatic', timeOffset: 30, timeUnit: 'min', message: 'Stretch time soon!', enabled: true },
          { id: 'rc3', type: 'workout_time', timeOffset: 0, timeUnit: 'min', message: 'Ready to stretch?', enabled: true },
        ],
        motivationStyle: 'friendly',
        confirmationEnabled: false,
        exercises: [
          { id: 'ex-1', name: 'Cat-Cow Stretch', sets: 3, reps: 10, weight: 'BW' },
          { id: 'ex-2', name: 'Cobra Stretch', sets: 2, reps: 30, weight: 'BW' },
        ]
      };
    } else {
      return {
        id: '',
        day: 'Tomorrow',
        time: '6:00 AM',
        duration: '55 min',
        name: 'Strength — Push Day',
        type: ['Strength', 'Upper Body'],
        muscleGroups: ['Chest', 'Shoulders', 'Tricep'],
        energyLevel: 7,
        goal: 'Build Muscle',
        reminders: [
          { id: 'rc4', type: 'confirmation', timeOffset: 60, timeUnit: 'min', message: 'Kal ka workout ready hai?', enabled: true },
          { id: 'rc5', type: 'automatic', timeOffset: 60, timeUnit: 'min', message: '1 ghante mein workout!', enabled: true },
          { id: 'rc6', type: 'workout_time', timeOffset: 0, timeUnit: 'min', message: 'WORKOUT START!', enabled: true },
        ],
        motivationStyle: 'aggressive',
        confirmationEnabled: true,
        exercises: [
          { id: 'ex-1', name: 'Bench Press', sets: 4, reps: 10, weight: 80 },
          { id: 'ex-2', name: 'Dips', sets: 3, reps: 10, weight: 'BW' },
        ]
      };
    }
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    if (step === 5) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6C63FF', '#4CAF50', '#ffffff']
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const saveWorkout = () => {
    const finalWorkout = {
      ...draft,
      id: draft.id || `s-${Date.now()}`,
    } as WorkoutPlan;

    if (draft.id) {
      setScheduledWorkouts(scheduledWorkouts.map(w => w.id === draft.id ? finalWorkout : w));
      addNotification('Workout Updated', `${finalWorkout.name} updated for ${finalWorkout.day} at ${finalWorkout.time}`, 'info');
    } else {
      setScheduledWorkouts([...scheduledWorkouts, finalWorkout]);
      addNotification('New Workout Scheduled', `${finalWorkout.name} set for ${finalWorkout.day} at ${finalWorkout.time}`, 'success');
    }
    resetModal();
  };

  const deleteWorkout = (id: string) => {
    if (window.confirm("Pakka delete karna hai?")) {
      setScheduledWorkouts(scheduledWorkouts.filter(w => w.id !== id));
    }
  };

  const openSchedule = (workoutId?: string) => {
    if (workoutId) {
      const workout = scheduledWorkouts.find(w => w.id === workoutId);
      if (workout) {
        setDraft({...workout});
        setStep(1);
      }
    } else {
      const suggestion = getSuggestedWorkout();
      setDraft({...suggestion, id: undefined});
      setStep(1);
    }
    setIsOpen(true);
  };

  const resetModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(1);
      setDraft({
        name: 'New Workout',
        day: 'Tomorrow',
        time: '6:00 AM',
        energyLevel: 5,
        goal: 'Build Muscle',
        exercises: [
          { id: 'd1', name: 'Bench Press', sets: 4, reps: 10, weight: 80 },
          { id: 'd2', name: 'Shoulder Press', sets: 3, reps: 12, weight: 50 },
        ],
        reminders: [
          { id: 'rem-conf', type: 'confirmation', timeOffset: 20, timeUnit: 'absolute', message: 'Kal ka workout ready hai?', enabled: true },
          { id: 'rem-1h', type: 'automatic', timeOffset: 60, timeUnit: 'min', message: '1 ghante mein workout!', enabled: true },
          { id: 'rem-15m', type: 'automatic', timeOffset: 15, timeUnit: 'min', message: '15 min mein GYM TIME!', enabled: true },
          { id: 'rem-now', type: 'workout_time', timeOffset: 0, timeUnit: 'min', message: 'WORKOUT START KARO RAKESH!', enabled: true },
        ],
        motivationStyle: 'friendly',
        confirmationEnabled: true
      });
    }, 300);
  };

  const toggleType = (t: string) => {
    const currentTypes = draft.type || [];
    if (currentTypes.includes(t)) {
      setDraft({ ...draft, type: currentTypes.filter(x => x !== t) });
    } else {
      setDraft({ ...draft, type: [...currentTypes, t] });
    }
  };

  const toggleMuscle = (m: string) => {
    const current = draft.muscleGroups || [];
    if (current.includes(m)) {
      setDraft({ ...draft, muscleGroups: current.filter(x => x !== m) });
    } else {
      setDraft({ ...draft, muscleGroups: [...current, m] });
    }
  };

  const updateExercise = () => {
    if (!editingEx) return;
    const newExs = (draft.exercises || []).map(ex => ex.id === editingEx.id ? editingEx : ex);
    setDraft({ ...draft, exercises: newExs });
    setEditingEx(null);
  };

  const addExercise = () => {
    const newEx: ExerciseDetail = {
      id: `e-${Date.now()}`,
      name: 'New Exercise',
      sets: 3,
      reps: 10,
      weight: 0
    };
    setDraft({ ...draft, exercises: [...(draft.exercises || []), newEx] });
  };

  const removeExercise = (id: string) => {
    setDraft({ ...draft, exercises: (draft.exercises || []).filter(ex => ex.id !== id) });
  };

  const toggleReminder = (id: string) => {
    const newReminders = (draft.reminders || []).map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setDraft({ ...draft, reminders: newReminders });
  };

  const removeReminder = (id: string) => {
    setDraft({ ...draft, reminders: (draft.reminders || []).filter(r => r.id !== id) });
  };

  const addManualReminder = (val: number, unit: 'min' | 'hour') => {
    const newRem: SmartReminder = {
      id: `rem-${Date.now()}`,
      type: 'manual',
      timeOffset: val || 30,
      timeUnit: unit || 'min',
      message: `${val || 30} ${unit || 'min'} pehle reminder!`,
      enabled: true
    };
    setDraft({ ...draft, reminders: [...(draft.reminders || []), newRem] });
    setShowCustomPicker(false);
  };

  const updateReminderMessage = (id: string, msg: string) => {
    const newReminders = (draft.reminders || []).map(r => 
      r.id === id ? { ...r, message: msg } : r
    );
    setDraft({ ...draft, reminders: newReminders });
  };

  const updateConfirmationTime = (offset: number, unit: 'min' | 'hour' | 'absolute') => {
    const newReminders = (draft.reminders || []).map(r => 
      r.type === 'confirmation' ? { ...r, timeOffset: offset, timeUnit: unit } : r
    );
    setDraft({ ...draft, reminders: newReminders });
  };

  const applyMotivationStyle = (styleId: string) => {
    const templates = (styleTemplates as any)[styleId];
    if (!templates) return;

    const newReminders = (draft.reminders || []).map(r => {
      let msg = r.message;
      if (r.type === 'confirmation') msg = templates.confirmation;
      else if (r.type === 'workout_time') msg = templates.workout_time;
      else if (r.type === 'automatic' || r.type === 'manual') msg = templates.automatic;
      
      return { ...r, message: msg };
    });

    setDraft({ ...draft, motivationStyle: styleId, reminders: newReminders });
  };

  const updateTemplate = (styleId: string, type: 'confirmation' | 'automatic' | 'workout_time', val: string) => {
    setStyleTemplates(prev => ({
      ...prev,
      [styleId]: {
        ...(prev as any)[styleId],
        [type]: val
      }
    }));
  };

  const toggleConfirmation = () => {
    const isEnabling = !draft.confirmationEnabled;
    let newReminders = [...(draft.reminders || [])];
    
    if (isEnabling) {
      const hasConf = newReminders.some(r => r.type === 'confirmation');
      if (!hasConf) {
        newReminders.push({
          id: `conf-${Date.now()}`,
          type: 'confirmation',
          timeOffset: 60,
          timeUnit: 'min',
          message: 'Kal ka workout ready hai?',
          enabled: true
        });
      } else {
        newReminders = newReminders.map(r => r.type === 'confirmation' ? { ...r, enabled: true } : r);
      }
    } else {
      newReminders = newReminders.map(r => r.type === 'confirmation' ? { ...r, enabled: false } : r);
    }
    
    setDraft({ ...draft, confirmationEnabled: isEnabling, reminders: newReminders });
  };

  const getReminderTime = (workoutTime: string, offsetMin: number) => {
    try {
      const [time, period] = workoutTime.split(' ');
      const [h, m] = time.split(':').map(Number);
      let hours = h;
      if (period === 'PM' && h !== 12) hours += 12;
      if (period === 'AM' && h === 12) hours = 0;
      
      let totalMinutes = hours * 60 + (m || 0) - offsetMin;
      // Handle midnight wrap-around robustly for any offset
      totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

      const newHours = Math.floor(totalMinutes / 60);
      const newMins = totalMinutes % 60;
      
      const displayH = ((newHours + 11) % 12 + 1);
      const displayP = newHours >= 12 ? 'PM' : 'AM';
      return `${displayH}:${newMins.toString().padStart(2, '0')} ${displayP}`;
    } catch (error) {
      console.error("Error calculating reminder time:", error);
      return workoutTime;
    }
  };

  const getPreviewMessage = (msg: string) => {
    if (!msg) return "";
    return msg
      .replace('{name}', user.name)
      .replace('{time}', draft.time || '6:00 AM')
      .replace('{workout}', draft.name || 'Push Day')
      .replace('{streak}', MOCK_DATA.stats.streakDays.toString())
      .replace('{calories}', (MOCK_DATA.stats as any).caloriesToday?.toString() || '420')
      .replace('{offset}', '30 min');
  };

  const getEnergyBadge = (val: number) => {
    if (val <= 3) return "Light workout best hai";
    if (val <= 6) return "Moderate intensity sahi";
    return "Beast mode! 🔥";
  };

  const getMotivationMessage = () => {
    const messages = {
      lowSleep: [
        `Neend kam thi, par tu strong hai ${user.name}! Light workout se energy boost hoga 💪`,
        "Recovery day hai — stretch karo, body ko thank karo 🙏"
      ],
      highSteps: [
        `Kal tune ${MOCK_DATA.stats.stepsToday} steps liye — aaj strength add karo! 🔥`,
        "Step game strong hai! Ab muscles ki baari 💥"
      ],
      missedYesterday: [
        "Kal miss hua, koi baat nahi — aaj double dedication! ⚡",
        `Champions comeback karte hain — aaj tera din hai ${user.name}! 🏆`
      ],
      streak: [
        `${MOCK_DATA.stats.streakDays} din ka streak — mat todna! 🔥🔥🔥`,
        `Consistency hi real gains hai — ${MOCK_DATA.stats.streakDays} days strong! 💎`
      ],
      default: [
        `Workout time ${user.name}! Body tujhse better hone ka wait kar rahi hai 💪`,
        "Har rep ek step hai dream body ki taraf — chalo! 🚀"
      ]
    };

    let category: keyof typeof messages = 'default';
    if (MOCK_DATA.stats.streakDays >= 3) category = 'streak';
    else if (MOCK_DATA.stats.missedYesterday) category = 'missedYesterday';
    else if (MOCK_DATA.stats.sleep < 7) category = 'lowSleep';
    else if (MOCK_DATA.stats.stepsToday >= 8000) category = 'highSteps';

    const selectedCategory = messages[category];
    return selectedCategory[Math.floor(Math.random() * selectedCategory.length)];
  };

  const motivationMessage = getMotivationMessage();

  const editScheduled = (workout: WorkoutPlan) => {
    setDraft({ ...workout });
    setStep(1);
    setIsOpen(true);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] p-5 rounded-[2.5rem] border border-[#6C63FF]/30 shadow-2xl relative overflow-hidden mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="bg-[#6C63FF] p-2.5 rounded-2xl shadow-lg shadow-[#6C63FF]/20">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Smart Assistant</h3>
              <p className="text-xs text-gray-400">{user.name}, kal ka plan banao apne hisaab se</p>
            </div>
          </div>
        </div>

        {scheduledWorkouts.length > 0 && (
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                <Clock size={10} className="mr-1.5" /> Scheduled
              </p>
            </div>
            {scheduledWorkouts.map(w => (
              <div key={w.id} className="bg-black/40 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{w.day} {w.time}</span>
                  <span className="text-xs font-bold text-white">{w.name}</span>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editScheduled(w)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteWorkout(w.id)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-[#6C63FF] text-white py-4 rounded-3xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl shadow-[#6C63FF]/20"
        >
          <span>Plan My Workout</span>
          <ChevronRight size={18} />
        </button>
      </motion.div>

      {/* Main Scheduler Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-[400px] bg-[#0f0f0f] rounded-t-[3rem] p-6 relative z-10 border-t border-white/10 shadow-2xl overflow-hidden"
              style={{ height: '90vh' }}
            >
              {/* Progress Bar */}
              <div className="flex items-center space-x-2 mb-8 pr-12">
                {[1,2,3,4,5,6].map(s => (
                  <div 
                    key={s} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#6C63FF]' : 'bg-white/10'}`} 
                  />
                ))}
                <span className="text-[10px] font-bold text-gray-500 min-w-max ml-2 uppercase">Step {step} of 6</span>
              </div>

              <button onClick={resetModal} className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <div className="h-[calc(90vh-140px)] overflow-y-auto no-scrollbar pb-10">
                {/* STEP 1: TIME & DURATION */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 py-2">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black italic tracking-tighter">TIME CHOOSE KARO ⏰</h2>
                      <p className="text-sm text-gray-500">Kal kab workout karna hai?</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-[#6C63FF] tracking-widest pl-1">Preferred Times</p>
                      <div className="grid grid-cols-4 gap-2">
                        {['5:00AM', '5:30AM', '6:00AM', '6:30AM', '7:00AM', '7:30AM', '8:00AM', 'Custom'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setDraft({ ...draft, time: t })}
                            className={`py-3.5 rounded-2xl text-[11px] font-bold transition-all ${
                              draft.time === t ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30' : 'bg-[#1a1a1a] text-gray-400 hover:bg-white/5'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-[#6C63FF] tracking-widest pl-1">Duration</p>
                      <div className="grid grid-cols-5 gap-2">
                        {['20 min', '30 min', '45 min', '60 min', '90 min'].map(d => (
                          <button 
                            key={d}
                            onClick={() => setDraft({ ...draft, duration: d })}
                            className={`py-3 rounded-xl text-[10px] font-bold transition-all ${
                              draft.duration === d ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30' : 'bg-[#1a1a1a] text-gray-400 hover:bg-white/5'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: WORKOUT TYPE */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 py-2">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black italic tracking-tighter">WORKOUT TYPE 💪</h2>
                      <p className="text-sm text-gray-500">Kaisa workout karoge?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {WORKOUT_TYPES.map(type => (
                        <button 
                          key={type.id}
                          onClick={() => toggleType(type.label)}
                          className={`p-4 rounded-3xl flex items-center justify-between border transition-all ${
                            draft.type?.includes(type.label) 
                            ? 'bg-[#6C63FF] border-[#6C63FF] text-white' 
                            : 'bg-[#1a1a1a] border-white/5 text-gray-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{type.icon}</span>
                            <span className="text-xs font-bold">{type.label}</span>
                          </div>
                          {draft.type?.includes(type.label) && <CheckCircle2 size={16} />}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-black text-[#6C63FF] tracking-widest pl-1">Muscle Focus (Optional)</p>
                      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                        {MUSCLE_CHIPS.map(m => (
                          <button 
                            key={m}
                            onClick={() => toggleMuscle(m)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                              draft.muscleGroups?.includes(m)
                              ? 'bg-white text-black border-white'
                              : 'bg-transparent border-white/10 text-gray-500'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: MOOD & ENERGY */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 py-2">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black italic tracking-tighter">MOOD & ENERGY 🎯</h2>
                      <p className="text-sm text-gray-500">Aaj kaisa feel ho raha hai?</p>
                    </div>

                    <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] space-y-6">
                       <div className="flex justify-between items-center px-1">
                         <span className="text-[10px] font-bold text-gray-500 uppercase">Energy Level</span>
                         <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-colors ${
                           (draft.energyLevel || 0) <= 3 ? 'bg-blue-500/20 text-blue-400' :
                           (draft.energyLevel || 0) <= 6 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-500'
                         }`}>
                           {getEnergyBadge(draft.energyLevel || 0)}
                         </span>
                       </div>

                       <div className="relative pt-6 pb-2 px-2">
                          <input 
                            type="range" min="1" max="10" step="1"
                            value={draft.energyLevel}
                            onChange={(e) => setDraft({ ...draft, energyLevel: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-black rounded-full appearance-none cursor-pointer accent-[#6C63FF]"
                          />
                          <div className="flex justify-between mt-4 px-1">
                            <span className="text-sm">😴</span>
                            <span className="text-[10px] font-bold text-white">{draft.energyLevel}</span>
                            <span className="text-sm">🔥</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-2 pt-2">
                         {['Build Muscle', 'Burn Fat', 'Boost Energy', 'De-stress'].map(g => (
                           <button 
                             key={g}
                             onClick={() => setDraft({ ...draft, goal: g })}
                             className={`p-4 rounded-3xl text-[10px] font-bold transition-all border ${
                               draft.goal === g ? 'bg-white text-black border-white' : 'bg-black/40 border-white/5 text-gray-500'
                             }`}
                           >
                             {g}
                           </button>
                         ))}
                       </div>
                    </div>

                    <AnimatePresence>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#6C63FF]/10 p-5 rounded-[2rem] border border-[#6C63FF]/20 relative overflow-hidden"
                      >
                         <div className="flex items-start space-x-3 relative z-10">
                            <div className="bg-[#6C63FF] p-2 rounded-xl">
                              <Zap size={14} className="text-white" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black tracking-widest text-[#6C63FF] uppercase">AI Suggestion</p>
                              <p className="text-sm font-bold text-white leading-relaxed">
                                💡 Neend 6.8h + energy {draft.energyLevel} → Moderate Push Day best!
                              </p>
                            </div>
                         </div>
                          <div className="flex space-x-3 mt-4 relative z-10">
                             <button 
                               onClick={() => {
                                 const suggestion = getSuggestedWorkout();
                                 setDraft({ ...suggestion });
                               }}
                               className="flex-1 bg-[#6C63FF] text-[10px] font-black uppercase py-2.5 rounded-xl active:scale-95 transition-all"
                             >
                               Apply This
                             </button>
                             <button 
                               onClick={() => setDraft({ ...draft, energyLevel: Math.min(10, (draft.energyLevel || 5) + 1) })}
                               className="flex-1 bg-white/5 text-[10px] font-black uppercase py-2.5 rounded-xl text-gray-500 hover:text-white active:scale-95 transition-all"
                             >
                               Ignore
                             </button>
                          </div>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
                {/* STEP 4: CUSTOMIZE EXERCISES */}
                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-2">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black italic tracking-tighter">EXERCISE LIST 📋</h2>
                      <p className="text-sm text-gray-500">Apne hisaab se exercises add/remove karo</p>
                    </div>

                    <div className="space-y-3">
                      {(draft.exercises || []).map((ex) => (
                        <div key={ex.id} className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 flex items-center justify-between group">
                          <div className="flex items-center space-x-4">
                            <div className="bg-white/5 p-2 rounded-xl text-gray-400 group-hover:text-[#6C63FF] transition-colors">
                              <Dumbbell size={18} />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-white leading-tight">{ex.name}</p>
                               <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                 {ex.sets} Sets × {ex.reps} Reps • {ex.weight}kg
                               </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => setEditingEx(ex)}
                              className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => removeExercise(ex.id)}
                              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={addExercise}
                      className="w-full bg-white/5 border border-dashed border-white/10 py-5 rounded-3xl text-[10px] font-black uppercase text-gray-500 flex items-center justify-center space-x-2 hover:bg-white/[0.08] transition-colors"
                    >
                      <Plus size={14} />
                      <span>Add New Exercise</span>
                    </button>
                  </motion.div>
                )}

                {/* STEP 5: REMINDERS & MOTIVATION (REDESIGNED) */}
                {step === 5 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 py-2 pb-24 h-full overflow-y-auto no-scrollbar">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black italic tracking-tighter">REMINDERS 🔔</h2>
                      <p className="text-sm text-gray-500">Apne hisaab se time set karo</p>
                    </div>

                    {/* Part A: Custom Time Setter */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-1">
                         <p className="text-[10px] uppercase font-black text-[#6C63FF] tracking-widest">Automatic Reminders</p>
                         <span className="text-[10px] text-gray-500 font-bold">{(draft.reminders || []).filter(r => r.type === 'manual' || r.type === 'automatic').length}/5</span>
                       </div>
                       
                       <div className="flex flex-wrap gap-3">
                         {(draft.reminders || [])
                           .filter(r => r.type === 'manual' || r.type === 'automatic')
                           .map(rem => (
                             <div key={rem.id} className="bg-[#1a1a1a] px-4 py-3 rounded-2xl border border-white/5 flex items-center space-x-3 group animate-in fade-in zoom-in duration-300">
                               <Bell size={12} className={rem.enabled ? 'text-[#6C63FF]' : 'text-gray-600'} />
                               <span className="text-[11px] font-bold text-white/90">
                                 {getReminderTime(draft.time || '6:00 AM', rem.timeUnit === 'hour' ? rem.timeOffset * 60 : rem.timeOffset)} — {rem.timeOffset}{rem.timeUnit} before
                               </span>
                               <button 
                                 onClick={() => removeReminder(rem.id)}
                                 className="text-gray-500 hover:text-red-400 transition-colors"
                               >
                                 <X size={12} />
                               </button>
                             </div>
                         ))}
                       </div>
                       
                       <div className="space-y-4">
                         {((draft.reminders || []).filter(r => r.type === 'manual' || r.type === 'automatic').length < 5) && (
                           <div className="space-y-4">
                             <p className="text-[11px] text-gray-500 font-bold px-1">Naya reminder kab chahiye?</p>
                             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                               {[30, 60, 120].map(val => (
                                 <button 
                                   key={val}
                                   onClick={() => addManualReminder(val, val >= 60 ? 'hour' : 'min')}
                                   className="bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-4 rounded-2xl text-[11px] font-black text-gray-400 whitespace-nowrap"
                                 >
                                   {val >= 120 ? `${val/60} hr pehle` : val === 60 ? `1 hr pehle` : `${val} min pehle`}
                                 </button>
                               ))}
                               <button 
                                 onClick={() => setShowCustomPicker(true)}
                                 className="bg-[#6C63FF]/10 border border-[#6C63FF]/20 px-6 py-4 rounded-2xl text-[11px] font-black text-[#6C63FF] whitespace-nowrap"
                               >
                                 Custom ▼
                               </button>
                             </div>
                           </div>
                         )}

                         {showCustomPicker && (
                           <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-[#6C63FF]/30 space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase text-gray-500">Kitna pehle?</p>
                                <div className="flex bg-black/40 p-1 rounded-xl">
                                  {['min', 'hour'].map(u => (
                                    <button 
                                      key={u}
                                      onClick={() => setCustomUnit(u as any)}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${customUnit === u ? 'bg-white text-black' : 'text-gray-500'}`}
                                    >
                                      {u}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl">
                                <button onClick={() => setCustomValue(Math.max(1, customValue - 5))} className="p-2 text-[#6C63FF]"><Minus size={16} /></button>
                                <span className="text-xl font-black italic">{customValue} {customUnit}s</span>
                                <button onClick={() => setCustomValue(customValue + 5)} className="p-2 text-[#6C63FF]"><Plus size={16} /></button>
                              </div>
                              <div className="flex space-x-2 pt-2">
                                <button onClick={() => addManualReminder(customValue, customUnit)} className="flex-1 bg-[#6C63FF] text-white py-3 rounded-2xl text-[10px] font-black uppercase">Add Reminder</button>
                                <button onClick={() => setShowCustomPicker(false)} className="px-5 bg-white/5 text-gray-500 py-3 rounded-2xl text-[10px] font-black uppercase underline">Cancel</button>
                              </div>
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Part B: Confirmation Reminder */}
                    <div className="space-y-6">
                       <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden">
                          <div className="p-6 border-b border-white/5 flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                               <div className="bg-success/20 p-2 rounded-xl text-success">
                                 <CheckCircle2 size={16} />
                               </div>
                               <div>
                                 <p className="text-xs font-black uppercase italic tracking-tighter">CONFIRMATION REMINDER</p>
                                 <p className="text-[10px] text-gray-500">Assistant puchega — ready ho?</p>
                               </div>
                             </div>
                             <button 
                               onClick={toggleConfirmation}
                               className={`w-12 h-6 rounded-full relative transition-colors ${draft.confirmationEnabled ? 'bg-success' : 'bg-white/5'}`}
                             >
                                <motion.div 
                                  animate={{ x: draft.confirmationEnabled ? 26 : 4 }}
                                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                                />
                             </button>
                          </div>
                          
                          {draft.confirmationEnabled && (
                            <div className="p-6 space-y-6">
                               <div className="space-y-3">
                                 <p className="text-[10px] text-gray-500 font-bold">Confirmation kab poochhe?</p>
                                 <div className="flex flex-wrap gap-2">
                                   {[
                                     { label: '1 hr pehle', val: 60, unit: 'min' },
                                     { label: '2 hr pehle', val: 120, unit: 'min' },
                                     { label: '3 hr pehle', val: 180, unit: 'min' },
                                   ].map(opt => {
                                      const isSelected = (draft.reminders || []).find(r => r.type === 'confirmation')?.timeOffset === opt.val && 
                                                         (draft.reminders || []).find(r => r.type === 'confirmation')?.timeUnit === opt.unit;
                                      return (
                                        <button 
                                          key={opt.label}
                                          onClick={() => updateConfirmationTime(opt.val, opt.unit as any)}
                                          className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                                            isSelected ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                          }`}
                                        >
                                          {opt.label}
                                        </button>
                                      );
                                   })}
                                   <button 
                                     onClick={() => setShowCustomPicker(true)}
                                     className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                                       !([60, 120, 180].includes((draft.reminders || []).find(r => r.type === 'confirmation')?.timeOffset || 0)) 
                                       ? 'bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30' 
                                       : 'bg-white/5 border-white/10 text-gray-400'
                                     }`}
                                   >
                                     Custom
                                   </button>
                                 </div>
                               </div>

                               <div className="space-y-3">
                                 <p className="text-[10px] text-gray-500 font-bold">WhatsApp Style Notification Preview:</p>
                                 <div className="bg-[#0b141a] rounded-3xl p-5 border border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center space-x-3 mb-4">
                                       <div className="w-8 h-8 rounded-full bg-[#6C63FF] flex items-center justify-center text-white scale-75">
                                          <Zap size={16} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-white/90">HardReps Assistant 🤖</p>
                                          <p className="text-[7px] text-white/40 uppercase tracking-widest">Now • Notification</p>
                                       </div>
                                    </div>
                                    <div className="bg-[#202c33] rounded-2xl p-4 ml-4 relative">
                                       <div className="absolute -left-1 top-4 w-2 h-2 bg-[#202c33] rotate-45" />
                                       <p className="text-[11px] font-medium text-white/90 leading-relaxed">
                                          Rakesh, kal <span className="text-[#6C63FF] font-bold">{draft.time}</span> workout hai — ready ho? 💪
                                          <br/><span className="text-[10px] italic opacity-60 mt-1 block">
                                            "{draft.motivationStyle === 'aggressive' ? 'UTHH RAKESH READY HAI TU?! 💀' : 
                                              draft.motivationStyle === 'friendly' ? 'Kal workout hai, ready ho jao 😊' :
                                              draft.motivationStyle === 'calm' ? 'Kal workout scheduled hai, taiyar rehna 🌅' :
                                              'Bhai kal gym hai, ya excuse ready hai? 😂'}"
                                          </span>
                                       </p>
                                    </div>
                                    <div className="flex flex-col space-y-2 mt-4 ml-4">
                                       <button className="bg-[#25D366] text-black text-[10px] font-black uppercase py-2.5 rounded-xl shadow-lg shadow-[#25D366]/20">✅ Haan, Ready!</button>
                                       <div className="flex space-x-2">
                                          <button className="flex-1 bg-white/10 text-white text-[9px] font-bold py-2.5 rounded-xl">⏰ 30 min aur do</button>
                                          <button className="flex-1 bg-red-500/20 text-red-500 text-[9px] font-bold py-2.5 rounded-xl">❌ Aaj skip</button>
                                       </div>
                                    </div>
                                 </div>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Part C & D: Smart Reminder Chain / Motivation Style */}
                    <div className="space-y-6">
                       <p className="text-[10px] uppercase font-black text-[#6C63FF] tracking-widest pl-1">Smart Reminder Chain</p>
                       <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 p-6 space-y-8 relative">
                          <div className="absolute left-10 top-10 bottom-10 w-[2px] bg-gradient-to-b from-[#6C63FF] via-[#6C63FF]/30 to-transparent" />
                          
                          {(draft.reminders || []).sort((a,b) => b.timeOffset - a.timeOffset).map((rem, idx) => (
                             <div key={rem.id} className="flex items-start space-x-6 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#0f0f0f] transition-all ${rem.enabled ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30' : 'bg-[#2a2a2a] text-gray-500'}`}>
                                   {rem.type === 'confirmation' ? <CheckCircle2 size={12} /> : 
                                    rem.type === 'workout_time' ? <Flame size={12} /> : <Bell size={12} />}
                                </div>
                                <div className="flex-1">
                                   <div className="flex items-center justify-between">
                                      <p className={`text-[10px] font-black uppercase transition-all ${rem.enabled ? 'text-white' : 'text-gray-600'}`}>
                                         {rem.type === 'confirmation' ? '📱 CONFIRMATION (8PM)' : 
                                          rem.timeOffset === 0 ? '🏋️ WORKOUT TIME' : `🔔 ${rem.timeOffset}${rem.timeUnit} PEHLE`}
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        <button onClick={() => setEditingMsgId(rem.id)} className="p-1.5 text-gray-500 hover:text-[#6C63FF] transition-colors"><Edit3 size={12} /></button>
                                        <button onClick={() => toggleReminder(rem.id)} className={`w-8 h-4 rounded-full relative transition-colors ${rem.enabled ? 'bg-[#6C63FF]' : 'bg-white/5'}`}>
                                           <motion.div animate={{ x: rem.enabled ? 16 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full" />
                                        </button>
                                      </div>
                                   </div>
                                   <p className={`text-[11px] font-bold italic mt-1 leading-relaxed ${rem.enabled ? 'text-white/70' : 'text-gray-700'}`}>
                                      "{rem.message}"
                                   </p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-1">
                         <p className="text-[10px] uppercase font-black text-[#6C63FF] tracking-widest">Motivation Style</p>
                         <button 
                           onClick={() => setIsEditingTemplates(true)}
                           className="text-[9px] font-bold text-[#6C63FF] uppercase px-2 py-1 bg-[#6C63FF]/10 rounded-lg hover:bg-[#6C63FF]/20"
                         >
                           Edit Defaults ⚙️
                         </button>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         {MOTIVATION_STYLES.map(style => (
                           <button 
                             key={style.id}
                             onClick={() => applyMotivationStyle(style.id)}
                             className={`p-4 rounded-3xl flex flex-col items-center space-y-2 border transition-all ${
                               draft.motivationStyle === style.id ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] border-white/5 text-gray-500'
                             }`}
                           >
                             <span className="text-2xl">{style.icon}</span>
                             <span className="text-[10px] font-black uppercase text-center">{style.label}</span>
                           </button>
                         ))}
                       </div>
                    </div>

                    {/* Summary before footer */}
                    <div className="bg-[#6C63FF]/10 p-6 rounded-[2.5rem] border border-[#6C63FF]/30">
                       <p className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest mb-4">Teri Reminder Chain Summary:</p>
                       <div className="space-y-3">
                          {(draft.reminders || []).filter(r => r.enabled).sort((a,b) => b.timeOffset - a.timeOffset).map((r, i) => (
                             <div key={r.id} className="flex items-center space-x-3 text-[11px] font-bold text-white">
                                <span className="opacity-40">{i === 0 ? '🕗' : i === (draft.reminders || []).length - 1 ? '🏋️' : '✅'}</span>
                                <span>{r.type === 'confirmation' ? '8:00 PM poochega' : r.timeOffset === 0 ? '6:00 AM START!' : `${r.timeOffset}${r.timeUnit} pehle remind`}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: FINAL CONFIRMATION */}
                {step === 6 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-2">
                    <div className="text-center space-y-2">
                      <div className="w-20 h-20 bg-[#6C63FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={40} className="text-[#6C63FF]" />
                      </div>
                      <h2 className="text-2xl font-black italic tracking-tighter">ALL SET! 🏆</h2>
                      <p className="text-sm text-gray-500">Summary check karo aur confirm karo</p>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden">
                       <div className="p-6 bg-gradient-to-br from-[#6C63FF]/20 to-transparent border-b border-white/5">
                          <span className="text-[10px] text-[#6C63FF] font-black uppercase tracking-widest">Workout Overview</span>
                          <h3 className="text-lg font-black mt-1 italic uppercase tracking-tighter">{draft.name}</h3>
                          <div className="flex items-center space-x-4 mt-3">
                             <div className="flex items-center space-x-1">
                               <Clock size={12} className="text-gray-500" />
                               <span className="text-[10px] font-bold text-white">{draft.time} • {draft.duration}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Target size={12} className="text-gray-500" />
                               <span className="text-[10px] font-bold text-white">{draft.goal}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-6 space-y-4">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scheduled Alerts</p>
                          <div className="space-y-2">
                            {(draft.reminders || []).filter(r => r.enabled).map((r) => (
                               <div key={r.id} className="flex items-center space-x-2 text-[11px] font-bold text-white/70">
                                 <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full" />
                                 <span>
                                   <span className="text-white">{getReminderTime(draft.time || '6:00 AM', r.timeUnit === 'hour' ? r.timeOffset * 60 : r.timeOffset)}</span>
                                   {' — '}{r.type === 'confirmation' ? 'Confirmation' : r.timeOffset === 0 ? 'Workout time' : `${r.timeOffset}${r.timeUnit} before`}
                                 </span>
                               </div>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="bg-success/10 p-5 rounded-[2rem] border border-success/20">
                       <div className="flex items-start space-x-3">
                          <div className="bg-success p-2 rounded-xl text-white">
                            <TrendingUp size={14} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-success uppercase tracking-widest">Motivation Live</p>
                             <p className="text-xs font-bold text-white/90 leading-relaxed italic">
                               "{motivationMessage}"
                             </p>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0f0f0f] border-t border-white/5 flex items-center space-x-3">
                {step > 1 && (
                  <button 
                    onClick={handleBack}
                    className="flex-1 bg-white/5 text-[10px] font-black uppercase py-4 rounded-2xl text-gray-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={step === 6 ? saveWorkout : handleNext}
                  className="flex-[2] bg-[#6C63FF] text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#6C63FF]/20 active:scale-95 transition-all"
                >
                  {step === 6 ? 'Confirm & Finish' : 'Next Step'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Custom Editor Overlay */}
      <AnimatePresence>
        {editingMsgId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/95 backdrop-blur-xl"
               onClick={() => setEditingMsgId(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a1a1a] w-full max-w-[340px] rounded-[3rem] p-8 relative z-10 border border-white/10 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black italic tracking-tighter uppercase">Edit Message</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Personalize your push</p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/60 rounded-3xl p-5 border border-white/5">
                   <p className="text-[9px] font-black text-[#6C63FF] uppercase tracking-widest mb-3">Reminder text:</p>
                   <textarea 
                     className="w-full bg-transparent border-none outline-none text-sm font-mono text-white min-h-[120px] resize-none leading-relaxed placeholder:text-white/20"
                     value={(draft.reminders || []).find(r => r.id === editingMsgId)?.message}
                     onChange={(e) => updateReminderMessage(editingMsgId, e.target.value)}
                     placeholder="Write your custom message here..."
                   />
                </div>

                <div className="bg-[#6C63FF]/5 rounded-3xl p-5 border border-dashed border-[#6C63FF]/20">
                   <p className="text-[9px] font-black text-[#6C63FF] uppercase tracking-widest mb-1 opacity-50">Live Preview:</p>
                   <p className="text-xs font-bold text-white italic leading-relaxed">
                     "{(draft.reminders || []).find(r => r.id === editingMsgId) ? getPreviewMessage((draft.reminders || []).find(r => r.id === editingMsgId)!.message) : ''}"
                   </p>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Variables:</p>
                   <div className="flex flex-wrap gap-2">
                      {['{name}', '{time}', '{workout}', '{streak}', '{calories}'].map(v => (
                        <button 
                          key={v}
                          className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl text-[9px] font-black text-white/50 border border-white/5"
                          onClick={() => {
                            const cur = (draft.reminders || []).find(r => r.id === editingMsgId);
                            if (cur) updateReminderMessage(editingMsgId, cur.message + ' ' + v);
                          }}
                        >
                          {v}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => setEditingMsgId(null)}
                  className="flex-1 bg-[#6C63FF] text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#6C63FF]/30 active:scale-95 transition-all"
                >
                  Save ✓
                </button>
                <button 
                  onClick={() => {
                    const r = (draft.reminders || []).find(r => r.id === editingMsgId);
                    if (r) {
                      const styleId = draft.motivationStyle || 'friendly';
                      const templates = (styleTemplates as any)[styleId];
                      let msg = templates.automatic;
                      if (r.type === 'confirmation') msg = templates.confirmation;
                      else if (r.type === 'workout_time') msg = templates.workout_time;
                      updateReminderMessage(editingMsgId, msg);
                    }
                  }}
                  className="bg-white/5 text-gray-500 px-5 rounded-2xl text-[9px] font-bold uppercase hover:text-white transition-colors"
                >
                  Reset Style
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Default Templates Editor Overlay */}
      <AnimatePresence>
        {isEditingTemplates && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
               onClick={() => setIsEditingTemplates(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0f0f0f] w-full max-w-[360px] max-h-[80vh] rounded-[3.5rem] p-8 relative z-10 border border-white/10 shadow-2xl overflow-y-auto no-scrollbar space-y-8"
            >
              <div className="text-center space-y-1 sticky top-0 bg-[#0f0f0f] z-10 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Default Templates</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Set your style's baseline</p>
              </div>

              {MOTIVATION_STYLES.map(style => (
                 <div key={style.id} className="space-y-4">
                    <div className="flex items-center space-x-3">
                       <span className="text-2xl">{style.icon}</span>
                       <p className="text-[12px] font-black uppercase text-white/50 tracking-tighter">{style.label} Style</p>
                    </div>
                    
                    <div className="space-y-3 pl-2 border-l-2 border-white/5 ml-3">
                       {['confirmation', 'automatic', 'workout_time'].map(type => (
                         <div key={type} className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{type.replace('_', ' ')}:</label>
                            <input 
                               type="text" 
                               value={(styleTemplates as any)[style.id][type]}
                               onChange={(e) => updateTemplate(style.id, type as any, e.target.value)}
                               className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 text-xs font-bold text-white focus:border-[#6C63FF] outline-none"
                            />
                         </div>
                       ))}
                    </div>
                 </div>
              ))}

              <div className="sticky bottom-0 bg-[#0f0f0f] pt-4 border-t border-white/5">
                 <button 
                   onClick={() => setIsEditingTemplates(false)}
                   className="w-full bg-[#6C63FF] text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-[#6C63FF]/30 active:scale-95 transition-all"
                 >
                   Save All Templates
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exercise Edit Modal Overlay */}
      <AnimatePresence>
        {editingEx && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
               onClick={() => setEditingEx(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] w-full max-w-[340px] rounded-[2.5rem] p-8 relative z-10 border border-white/10 shadow-2xl space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black italic tracking-tighter uppercase">Edit Exercise</h3>
                <p className="text-xs text-gray-500">Customize sets, reps and weight</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest">Exercise Name</label>
                  <input 
                    type="text" value={editingEx.name}
                    onChange={(e) => setEditingEx({ ...editingEx, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-[#6C63FF] transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sets</label>
                    <div className="flex items-center justify-between bg-black/40 rounded-2xl p-2 border border-white/5">
                       <button 
                         onClick={() => setEditingEx({ ...editingEx, sets: Math.max(1, editingEx.sets - 1) })}
                         className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                       >
                         <Minus size={14} />
                       </button>
                       <span className="text-sm font-bold text-white">{editingEx.sets}</span>
                       <button 
                         onClick={() => setEditingEx({ ...editingEx, sets: editingEx.sets + 1 })}
                         className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
                       >
                         <Plus size={14} />
                       </button>
                    </div>
                  </div>
                  <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reps</label>
                    <div className="flex items-center justify-between bg-black/40 rounded-2xl p-2 border border-white/5">
                       <button 
                         onClick={() => setEditingEx({ ...editingEx, reps: Math.max(1, editingEx.reps - 1) })}
                         className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                       >
                         <Minus size={14} />
                       </button>
                       <span className="text-sm font-bold text-white">{editingEx.reps}</span>
                       <button 
                         onClick={() => setEditingEx({ ...editingEx, reps: editingEx.reps + 1 })}
                         className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
                       >
                         <Plus size={14} />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight (kg / BW)</label>
                  <input 
                    type="text" value={editingEx.weight}
                    onChange={(e) => setEditingEx({ ...editingEx, weight: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-[#6C63FF] transition-all outline-none"
                    placeholder="e.g. 80 or BW"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={updateExercise}
                  className="w-full bg-[#6C63FF] text-white py-4 rounded-3xl text-[10px] font-black uppercase shadow-xl shadow-[#6C63FF]/30 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
