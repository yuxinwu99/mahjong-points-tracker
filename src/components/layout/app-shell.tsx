import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Languages, Moon, Sun } from 'lucide-react';
import i18n from '../../lib/i18n';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'dark'; // Default to dark for premium feel
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Premium Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Mahjong Points
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full hover:bg-slate-800/50 dark:hover:bg-slate-100/10"
            >
              <Languages className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-slate-800/50 dark:hover:bg-slate-100/10"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8 max-w-2xl">
        {children}
      </main>
    </div>
  );
}
