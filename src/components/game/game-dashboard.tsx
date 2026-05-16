import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { gameStore, resetGame } from '../../store/game-store';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { History, LogOut, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { RoundModal } from './round-modal';
import { useNavigate } from '@tanstack/react-router';

export function GameDashboard() {
  const { t } = useTranslation();
  const state = useStore(gameStore);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!state) return null;

  const handleEndSession = () => {
    if (window.confirm(t('game.confirm_end'))) {
      resetGame();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-400">
            {t('game.round')} <span className="text-white text-lg">{state.roundNum}</span>
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1">
              {t('game.dealer')}: {state.players[state.dealerIndex].name}
            </Badge>
            {state.currentStreakCount > 1 && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {t('game.lian')} {state.currentStreakCount - 1}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/history' })} className="rounded-full">
            <History className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleEndSession} className="rounded-full text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        {state.players.map((player, i) => {
          const points = player.history.reduce((a, b) => a + b, 0);
          const isDealer = i === state.dealerIndex;
          
          return (
            <Card key={i} className={`relative overflow-hidden border-neutral-800 bg-neutral-900/40 backdrop-blur-sm transition-all duration-300 ${isDealer ? 'ring-2 ring-indigo-500/30 border-indigo-500/30' : ''}`}>
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                <span className="text-sm font-medium text-neutral-400 truncate w-full text-center">
                  {player.name}
                </span>
                <span className={`text-3xl font-bold tabular-nums ${points > 0 ? 'text-emerald-400' : points < 0 ? 'text-red-400' : 'text-neutral-200'}`}>
                  {points > 0 ? '+' : ''}{points}
                </span>
                {isDealer && (
                  <div className="absolute top-0 right-0 p-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="pt-4">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="w-full h-16 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 rounded-2xl group transition-all"
        >
          <PlusCircle className="mr-2 w-6 h-6 group-hover:scale-110 transition-transform" />
          {t('game.end_round')}
        </Button>
      </div>

      <RoundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
