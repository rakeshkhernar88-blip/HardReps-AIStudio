/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  LineController,
  BarController,
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ChartData
} from 'chart.js';
import { Chart, Line } from 'react-chartjs-2';
import { MOCK_DATA, COLORS } from '../../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StatsTab() {
  const stepsBarData: ChartData<'bar' | 'line'> = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        type: 'bar' as const,
        label: 'Steps',
        data: MOCK_DATA.weeklySteps,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
      },
      {
        type: 'line' as const,
        label: 'Goal',
        data: new Array(7).fill(10000),
        borderColor: COLORS.accent,
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }
    ],
  };

  const hrLineData = {
    labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'],
    datasets: [
      {
        label: 'HR',
        data: [65, 72, 85, 110, 145, 95, 70],
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: COLORS.textMuted, font: { size: 9 } } },
      y: { display: false },
    },
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Your Progress</h2>
        <p className="text-sm text-gray-500">Weekly Performance Report</p>
      </header>

      <section className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold">Weekly Steps</h3>
        <div className="h-32">
          <Chart type="bar" data={stepsBarData} options={commonOptions} />
        </div>
        <div className="pt-2 border-t border-white/5 flex justify-between">
           <div>
              <p className="text-[10px] text-gray-500 uppercase">Avg Steps</p>
              <p className="text-sm font-bold">8,004</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Vs Last Week</p>
              <p className="text-sm font-bold text-[#4CAF50]">+12.5%</p>
           </div>
        </div>
      </section>

      <section className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold">Heart Rate Trend</h3>
        <div className="h-32">
          <Line data={hrLineData} options={commonOptions} />
        </div>
        <div className="pt-2 border-t border-white/5 flex justify-between">
           <div>
              <p className="text-[10px] text-gray-500 uppercase">Resting HR</p>
              <p className="text-sm font-bold">62 BPM</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Max Today</p>
              <p className="text-sm font-bold text-[#FF6B6B]">145 BPM</p>
           </div>
        </div>
      </section>

      <section className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5">
        <h3 className="text-sm font-semibold mb-4">Monthly Breakdown</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-white/5">
              <th className="text-left py-2 font-medium">Metric</th>
              <th className="text-right py-2 font-medium">Value</th>
              <th className="text-right py-2 font-medium">Goal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { label: 'Workouts', val: '18', goal: '20' },
              { label: 'Calories', val: '52,430', goal: '60,000' },
              { label: 'Steps', val: '242K', goal: '300K' },
            ].map(row => (
              <tr key={row.label}>
                <td className="py-3 text-gray-400">{row.label}</td>
                <td className="py-3 text-right font-bold">{row.val}</td>
                <td className="py-3 text-right text-gray-500">{row.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
