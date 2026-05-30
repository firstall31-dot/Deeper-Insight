import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <Button variant="ghost" size="icon" aria-label="Toggle theme" className="w-9 h-9" />;

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="w-9 h-9 relative"
    >
      <Sun className={`h-4 w-4 transition-all duration-200 ${isDark ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'} absolute`} />
      <Moon className={`h-4 w-4 transition-all duration-200 ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'} absolute`} />
    </Button>
  );
}
