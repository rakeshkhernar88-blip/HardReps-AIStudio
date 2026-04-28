/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLORS = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  primary: '#6C63FF',
  accent: '#FF6B6B',
  success: '#4CAF50',
  text: '#ffffff',
  textMuted: '#888888',
};

export const MOCK_DATA = {
  user: {
    name: 'Rakesh',
  },
  stats: {
    steps: 8432,
    stepsGoal: 10000,
    bpm: 72,
    bpmMax: 145,
    sleep: 6.8,
    calories: 2340,
    stepsToday: 8432,
    sleepHours: 6.8,
    deepSleep: 72,
    heartRate: 72,
    streakDays: 5,
    lastWorkout: "yesterday",
    preferredTime: "6:00 AM",
    missedYesterday: false,
  },
  sleepData: {
    total: 6.8,
    deep: 72,
    rem: 54,
    light: 148,
    awake: 18,
    bedtime: '11:30 PM',
    wakeTime: '6:30 AM',
    qualityScore: 78, // Excellent / Good / Fair / Poor
    weeklyTrend: [72, 85, 68, 90, 78, 82, 78],
  },
  weeklySteps: [6200, 9100, 7800, 10200, 8400, 5900, 8432],
  exercises: [
    { id: '1', name: 'Bench Press', sets: 4, reps: 10, weight: 80, completed: [] },
    { id: '2', name: 'Pull Ups', sets: 3, reps: 12, weight: 0, completed: [] },
    { id: '3', name: 'Squat', sets: 4, reps: 8, weight: 120, completed: [] },
    { id: '4', name: 'Shoulder Press', sets: 3, reps: 10, weight: 45, completed: [] },
    { id: '5', name: 'Deadlift', sets: 3, reps: 5, weight: 140, completed: [] },
  ],
  workoutHistory: [
    {
      id: 'h1',
      date: 'Oct 22, 2023',
      name: 'Full Body Power',
      duration: '65 min',
      calories: 450,
      startTime: '6:30 AM',
      endTime: '7:35 AM',
      avgHeartRate: 112,
      maxHeartRate: 155,
      exercises: [
        { name: 'Squat', sets: 3, reps: '5, 5, 5', weight: '125kg' },
        { name: 'Bench Press', sets: 3, reps: '8, 8, 8', weight: '85kg' },
        { name: 'Deadlift', sets: 1, reps: '5', weight: '150kg' },
      ],
      heartRateZones: [
        { zone: 0, label: 'Resting mode', sublabel: '-', range: '<94 bpm', time: '12m 45s', color: '#888888' },
        { zone: 1, label: 'Warm Up', sublabel: '-', range: '94-113 bpm', time: '15m 20s', color: '#6C63FF' },
        { zone: 2, label: 'Fat Burning', sublabel: '-', range: '114-132 bpm', time: '25m 10s', color: '#4FC3F7' },
        { zone: 3, label: 'Aerobic', sublabel: '-', range: '133-150 bpm', time: '10m 45s', color: '#4CAF50' },
        { zone: 4, label: 'Anaerobic', sublabel: '-', range: '>150 bpm', time: '1m 0s', color: '#FFA726' },
      ]
    },
    {
      id: 'h2',
      date: 'Oct 20, 2023',
      name: 'Upper Body Pump',
      duration: '45 min',
      calories: 310,
      startTime: '5:15 PM',
      endTime: '6:00 PM',
      avgHeartRate: 105,
      maxHeartRate: 142,
      exercises: [
        { name: 'Pull Ups', sets: 4, reps: '12, 10, 8, 8', weight: 'BW' },
        { name: 'Shoulder Press', sets: 3, reps: '10, 10, 10', weight: '50kg' },
        { name: 'Bicep Curls', sets: 3, reps: '12, 12, 12', weight: '15kg' },
      ],
      heartRateZones: [
        { zone: 0, label: 'Resting mode', sublabel: '-', range: '<94 bpm', time: '5m 0s', color: '#888888' },
        { zone: 1, label: 'Warm Up', sublabel: '-', range: '94-113 bpm', time: '20m 0s', color: '#6C63FF' },
        { zone: 2, label: 'Fat Burning', sublabel: '-', range: '114-132 bpm', time: '15m 0s', color: '#4FC3F7' },
        { zone: 3, label: 'Aerobic', sublabel: '-', range: '133-150 bpm', time: '5m 0s', color: '#4CAF50' },
      ]
    },
    {
      id: 'h3',
      date: 'Oct 18, 2023',
      name: 'Quick Cardio + Core',
      duration: '30 min',
      calories: 280,
      startTime: '7:00 AM',
      endTime: '7:30 AM',
      avgHeartRate: 130,
      maxHeartRate: 162,
      exercises: [
        { name: 'Plank', sets: 3, reps: '60s', weight: '-' },
        { name: 'Leg Raises', sets: 3, reps: '15', weight: '-' },
      ],
      heartRateZones: [
        { zone: 1, label: 'Warm Up', sublabel: '-', range: '94-113 bpm', time: '5m 0s', color: '#6C63FF' },
        { zone: 2, label: 'Fat Burning', sublabel: '-', range: '114-132 bpm', time: '10m 0s', color: '#4FC3F7' },
        { zone: 3, label: 'Aerobic', sublabel: '-', range: '133-150 bpm', time: '12m 0s', color: '#4CAF50' },
        { zone: 4, label: 'Anaerobic', sublabel: '-', range: '>150 bpm', time: '3m 0s', color: '#FFA726' },
      ]
    }
  ]
};
