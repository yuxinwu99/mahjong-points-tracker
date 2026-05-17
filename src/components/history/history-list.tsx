import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from '@tanstack/react-store';
import { gameStore } from '../../store/game-store';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';
import { EditRoundDialog } from './edit-round-dialog';
import type { RoundResult } from '../../types/game';

export function HistoryList() {
  const { t } = useTranslation();
  const state = useSelector(gameStore, (state) => state);
  const navigate = useNavigate();
  const [editingRound, setEditingRound] = useState<RoundResult | null>(null);

  if (!state) return null;

  const reversedHistory = [...state.roundHistory].reverse();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('game.history')}</h2>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {t('game.edit_disclaimer')}
        </p>
      </div>

      <div className="space-y-4">
        {reversedHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            {t('game.no_history')}
          </div>
        ) : (
          reversedHistory.map((round, idx) => (
            <Card key={round.roundNum} className="border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{t('game.round')} {round.roundNum}</span>
                    <Badge variant="outline" className="text-xs uppercase border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      x{round.multiplier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{state.players[round.winnerIndex].name}</span> {t('game.wins')}
                    </span>
                    {round.roundNum === state.roundHistory.length && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        onClick={() => setEditingRound(round)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Players Header Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center">
                    <div />
                    {state.players.map((p, pIdx) => (
                      <div key={pIdx} className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase text-center truncate">
                        {p.name}
                      </div>
                    ))}
                  </div>

                  {/* Score Change Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                      {t('game.score_change')}
                    </div>
                    {round.scoreChanges.map((change, pIdx) => (
                      <div key={pIdx} className={`text-sm font-black text-center ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                        {change > 0 ? '+' : ''}{change}
                      </div>
                    ))}
                  </div>

                  {/* Field Points Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                      {t('game.field_points_short')}
                    </div>
                    {round.fieldPoints.map((pts, pIdx) => (
                      <div key={pIdx} className="text-sm font-bold text-center text-slate-600 dark:text-slate-400">
                        {pts}
                      </div>
                    ))}
                  </div>

                  {/* Total Score Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-2 items-center py-2">
                    <div className="text-xs font-black text-indigo-400 dark:text-indigo-600 uppercase tracking-tighter">
                      {t('game.total_score')}
                    </div>
                    {round.scoresAfter.map((total, pIdx) => (
                      <div key={pIdx} className="text-sm font-black text-center text-slate-900 dark:text-white">
                        {total}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EditRoundDialog 
        round={editingRound}
        isOpen={!!editingRound}
        onClose={() => setEditingRound(null)}
      />
    </div>
  );
}
