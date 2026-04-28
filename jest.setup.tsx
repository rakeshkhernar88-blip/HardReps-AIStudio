import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock standard elements if needed
global.jest = jest;

// Mock lucide-react to return real components instead of just names
jest.mock('lucide-react', () => {
  const icons: any = {};
  [
    'Send', 'Bot', 'User', 'Sparkles', 'Settings', 'X', 'Check', 
    'MessageSquare', 'Heart', 'Flame', 'Ghost', 'RefreshCcw', 'TrendingUp', 'Moon', 'BookText', 'Activity', 'LayoutGrid', 'Zap'
  ].forEach(icon => {
    icons[icon] = (props: any) => <div data-testid={`icon-${icon}`} {...props} />;
  });
  return icons;
});

jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, layout, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, layout, ...props }: any) => <span {...props}>{children}</span>,
    header: ({ children, layout, ...props }: any) => <header {...props}>{children}</header>,
    button: ({ children, layout, ...props }: any) => <button {...props}>{children}</button>,
    input: ({ children, layout, ...props }: any) => <input {...props}>{children}</input>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
