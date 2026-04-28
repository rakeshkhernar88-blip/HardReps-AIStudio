import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AICoachTab from '../components/tabs/AICoachTab';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../context/NotificationContext');
jest.mock('../context/UserContext');
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: 'Mock response from AI'
        })
      }
    }))
  };
});

// Mock constants
jest.mock('../constants', () => ({
  MOCK_DATA: {
    stats: { stepsToday: 8000, calories: 400, sleep: 7, stepsGoal: 10000 },
    sleepData: { bedtime: '10:00 PM', wakeTime: '06:00 AM' },
    weeklySteps: [8000, 9000],
    workoutHistory: []
  }
}));

describe('AICoachTab Integration', () => {
  const mockAddNotification = jest.fn();
  const mockUser = {
    name: 'Rakesh',
    assistantStyle: 'friendly',
    reminders: []
  };

  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'mock-key';
  });

  beforeEach(() => {
    (useNotifications as jest.Mock).mockReturnValue({ addNotification: mockAddNotification });
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      updateUser: jest.fn(),
      addReminder: jest.fn(),
      toggleReminder: jest.fn()
    });
  });

  test('renders initial greeting and sends a message', async () => {
    render(<AICoachTab />);
    
    // Check initial message
    expect(screen.getByText(/Aaj 8,432 steps ho gaye hain/i)).toBeInTheDocument();

    // Type message
    const input = screen.getByPlaceholderText(/Ask your coach/i);
    fireEvent.change(input, { target: { value: 'How is my sleep?' } });
    
    // Click send
    const sendBtn = screen.getByLabelText(/Send message/i);
    fireEvent.click(sendBtn);

    // Verify user message appears
    expect(screen.getByText('How is my sleep?')).toBeInTheDocument();

    // Verify typing indicator (mocked behavior is instant in testing usually unless we wait)
    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('Mock response from AI')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
