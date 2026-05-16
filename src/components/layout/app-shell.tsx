import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Languages } from 'lucide-react';
import i18n from '../../lib/i18n';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      {/* Premium Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-neutral-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Mahjong Points
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="hover:bg-neutral-800/50 rounded-full"
          >
            <Languages className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8 max-w-2xl">
        {children}
      </main>
    </div>
  );
}
