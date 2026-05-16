import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { gameStore, addRound } from '../../store/game-store';
import { useForm } from '@tanstack/react-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface RoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoundModal({ isOpen, onClose }: RoundModalProps) {
  const { t } = useTranslation();
  const state = useStore(gameStore);

  const form = useForm({
    defaultValues: {
      winnerIndex: -1,
      multiplier: 1,
      fieldPoints: [0, 0, 0, 0],
    },
    onSubmit: async ({ value }) => {
      if (value.winnerIndex === -1) {
        alert(t('game.select_winner'));
        return;
      }
      addRound(value.winnerIndex, value.multiplier, value.fieldPoints);
      onClose();
      form.reset();
    },
  });

  if (!state) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-neutral-50 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('game.round_results')}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          {/* Winner Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
              {t('game.who_won')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {state.players.map((p, i) => (
                <form.Field
                  key={i}
                  name="winnerIndex"
                  children={(field) => (
                    <Button
                      type="button"
                      variant={field.state.value === i ? 'default' : 'outline'}
                      className={`h-12 border-neutral-800 ${field.state.value === i ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-neutral-950 hover:bg-neutral-900'}`}
                      onClick={() => field.handleChange(i)}
                    >
                      {p.name}
                      {i === state.dealerIndex && (
                        <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                          {t('game.dealer')}
                        </span>
                      )}
                    </Button>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Multiplier */}
          <form.Field
            name="multiplier"
            children={(field) => (
              <div className="space-y-3">
                <Label htmlFor="multiplier" className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  {t('game.multiplier')}
                </Label>
                <Input
                  id="multiplier"
                  type="number"
                  min={1}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
                  className="bg-neutral-950 border-neutral-800 h-12 text-lg"
                />
              </div>
            )}
          />

          {/* Field Points */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
              {t('game.field_points')}
            </Label>
            <div className="space-y-3">
              {state.players.map((p, i) => (
                <form.Field
                  key={i}
                  name={`fieldPoints[${i}]` as any}
                  children={(field) => (
                    <div className="flex items-center justify-between gap-4 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                      <Label className="text-sm font-medium truncate flex-1">
                        {p.name}
                        {i === state.dealerIndex && (
                          <span className="ml-2 text-[10px] text-indigo-400">({t('game.dealer')})</span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        className="w-24 bg-neutral-900 border-neutral-800 h-9"
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
              {t('game.cancel')}
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500">
              {t('game.calculate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
