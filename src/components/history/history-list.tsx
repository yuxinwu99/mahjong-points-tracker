import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { gameStore } from '../../store/game-store';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';

export function HistoryList() {
  const { t } = useTranslation();
  const state = useStore(gameStore);
  const navigate = useNavigate();

  if (!state) return null;

  const reversedHistory = [...state.roundHistory].reverse();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">{t('game.history')}</h2>
      </div>

      <div className="space-y-4">
        {reversedHistory.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No history yet
          </div>
        ) : (
          reversedHistory.map((round, idx) => (
            <Card key={idx} className="border-neutral-800 bg-neutral-900/40 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400">{t('game.round')} {round.roundNum}</span>
                    <Badge variant="outline" className="text-[10px] uppercase border-neutral-700">
                      x{round.multiplier}
                    </Badge>
                  </div>
                  <span className="text-sm text-neutral-400">
                    <span className="text-emerald-400 font-medium">{state.players[round.winnerIndex].name}</span> {t('game.wins')}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {round.scoreChanges.map((change, pIdx) => (
                    <div key={pIdx} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-neutral-500 truncate w-full text-center">
                        {state.players[pIdx].name}
                      </span>
                      <span className={`text-sm font-bold ${change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                        {change > 0 ? '+' : ''}{change}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
