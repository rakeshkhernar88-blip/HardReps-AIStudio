/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { History, Search } from 'lucide-react';
import { MOCK_DATA } from '../../constants';
import WorkoutSessionCard, { WorkoutSession } from '../WorkoutSessionCard';

interface HistoryTabProps {
  history: WorkoutSession[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workout History</h2>
          <p className="text-sm text-gray-500">Relive your gains</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF]">
          <History size={20} />
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input 
          type="text" 
          placeholder="Search sessions..."
          className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
        />
      </div>

      <div className="space-y-4">
        {history.map((session) => (
          <WorkoutSessionCard 
            key={session.id}
            session={session}
            isSelected={selectedId === session.id}
            onToggle={() => setSelectedId(selectedId === session.id ? null : session.id)}
          />
        ))}
      </div>
    </div>
  );
}
