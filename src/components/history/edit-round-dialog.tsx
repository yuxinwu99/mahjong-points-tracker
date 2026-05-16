import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { gameStore, updateRound, deleteRound } from '../../store/game-store';
import { useForm } from '@tanstack/react-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { RoundResult } from '../../types/game';

interface EditRoundDialogProps {
  round: RoundResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRoundDialog({ round, isOpen, onClose }: EditRoundDialogProps) {
  const { t } = useTranslation();
  const state = useStore(gameStore);

  const form = useForm({
    defaultValues: {
      winnerIndex: round?.winnerIndex ?? -1,
      multiplier: round?.multiplier ?? 1,
      fieldPoints: round?.fieldPoints ? [...round.fieldPoints] : [0, 0, 0, 0],
    },
    onSubmit: async ({ value }) => {
      if (!round) return;
      if (value.winnerIndex === -1) {
        alert(t('game.select_winner'));
        return;
      }
      updateRound(round.roundNum, value.winnerIndex, value.multiplier, value.fieldPoints);
      onClose();
    },
  });

  if (!state || !round) return null;

  const handleDelete = () => {
    if (confirm(t('game.confirm_delete'))) {
      deleteRound(round.roundNum);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none text-slate-900 dark:text-slate-50 p-0 overflow-hidden rounded-3xl shadow-3xl">
        <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            {t('game.edit_round')} {round.roundNum}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="p-6 space-y-8 overflow-y-auto max-h-[70vh]"
        >
          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
              {t('game.edit_disclaimer')}
            </p>
          </div>
          {/* Winner Selection */}
          <div className="space-y-4">
            <Label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t('game.who_won')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {state.players.map((p, i) => (
                <form.Field
                  key={i}
                  name="winnerIndex"
                  children={(field) => (
                    <button
                      type="button"
                      onClick={() => field.handleChange(i)}
                      className={`h-16 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center relative overflow-hidden ${
                        field.state.value === i
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <span className="text-sm truncate w-full px-2 text-center">{p.name}</span>
                      {i === round.dealerIndex && (
                        <span className={`text-xs uppercase mt-1 ${field.state.value === i ? 'text-indigo-400' : 'text-slate-500'}`}>
                          {t('game.dealer')}
                        </span>
                      )}
                      {field.state.value === i && (
                        <div className="absolute top-0 right-0 p-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        </div>
                      )}
                    </button>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Multiplier */}
          <form.Field
            name="multiplier"
            children={(field) => (
              <div className="space-y-4">
                <Label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {t('game.multiplier')}
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-14 h-14 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    onClick={() => field.handleChange(Math.max(1, field.state.value - 1))}
                  >
                    <Minus className="w-6 h-6" />
                  </Button>
                  <div className="flex-1 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white">
                    {field.state.value}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-14 h-14 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    onClick={() => field.handleChange(field.state.value + 1)}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}
          />

          {/* Field Points */}
          <div className="space-y-4">
            <Label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t('game.field_points')}
            </Label>
            <div className="space-y-2">
              {state.players.map((p, i) => (
                <form.Field
                  key={i}
                  name={`fieldPoints[${i}]` as any}
                  children={(field) => (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.name}</span>
                        {i === round.dealerIndex && (
                          <span className="text-xs text-indigo-500 font-black">({t('game.dealer')})</span>
                        )}
                      </div>
                      <input
                        type="number"
                        className="w-20 bg-white dark:bg-slate-900 border-none focus:ring-0 rounded-lg h-9 text-right font-black text-slate-900 dark:text-white p-2"
                        value={field.state.value}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg uppercase tracking-wide rounded-2xl shadow-xl shadow-indigo-500/20"
            >
              {t('game.save')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-14 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 font-bold uppercase text-xs tracking-widest rounded-2xl"
            >
              {t('game.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
