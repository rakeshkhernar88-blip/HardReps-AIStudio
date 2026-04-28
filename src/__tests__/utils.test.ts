import { getSystemPrompt } from '../utils/aiUtils';
import { calculateTimeline } from '../utils/growthUtils';
import { parseStepsData } from '../utils/fitUtils';

describe('Utility Logic Tests', () => {
  test('getSystemPrompt injects fitData correctly', () => {
    const mockData = {
      steps: 8432,
      calories: 450,
      sleep: 420,
      weeklyData: [{ name: 'Mon', steps: 10000, sleep: 7 }],
      goals: { steps: 10000, sleep: 480 },
      activities: [{ date: '2024-01-01', name: 'Workout', duration: 45 }]
    };

    const prompt = getSystemPrompt(mockData);
    expect(prompt).toContain('Steps: 8432');
    expect(prompt).toContain('Steps 10000');
    expect(prompt).toContain('Mon: 10000 steps');
    expect(prompt).toContain('Workout 45m');
  });

  test('calculateTimeline predicts correct months', () => {
    // Current: 100, Target: 110, Freq: 3, Diet: Bulk (0.3 rate)
    // growthRate = 3 * 0.3 = 0.9
    // diff = 10, months = ceil(10 / 0.9) = 12
    const result = calculateTimeline(100, 110, 3, 'Bulk');
    expect(result.months).toBe(12);
    expect(result.milestoneData.length).toBe(6);
    expect(result.milestoneData[0].y).toBe(100);
  });

  test('parseStepsData handles complex Google Fit JSON', () => {
    const mockResponse = {
      bucket: [
        {
          dataset: [
            {
              point: [
                { value: [{ intVal: 1500 }] },
                { value: [{ intVal: 500 }] }
              ]
            }
          ]
        }
      ]
    };
    expect(parseStepsData(mockResponse)).toBe(2000);
    expect(parseStepsData(null)).toBe(0);
  });
});
