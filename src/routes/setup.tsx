import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { startGame } from '../store/game-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';

export const Route = createFileRoute('/setup')({
  component: SetupPage,
});

function SetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      players: ['', '', '', ''],
      baseScore: 5,
      initialDealer: 0,
    },
    onSubmit: async ({ value }) => {
      const names = value.players.map((name, i) => name.trim() || t('setup.player_placeholder', { index: i + 1 }));
      startGame(names, value.baseScore, value.initialDealer);
      navigate({ to: '/' });
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
          Mahjong<span className="text-indigo-500">Tracker</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('setup.title')}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('setup.players')}
            </Label>
            <span className="text-[10px] text-slate-400 font-normal">{t('setup.order_disclaimer')}</span>
          </div>

          <div className="space-y-2">
            <form.Field
              name="initialDealer"
              children={(field) => (
                <div className="space-y-2">
                  {form.state.values.players.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => field.handleChange(i)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        field.state.value === i
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        readOnly
                        checked={field.state.value === i}
                        className="w-5 h-5 accent-indigo-500 cursor-pointer pointer-events-none"
                      />
                      <span className="text-xs font-bold text-slate-400 w-4 text-center pointer-events-none">{i + 1}</span>
                      <form.Field
                        name={`players[${i}]` as any}
                        children={(playerField) => (
                          <input
                            placeholder={t('setup.player_placeholder', { index: i + 1 })}
                            value={playerField.state.value}
                            onChange={(e) => playerField.handleChange(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      />
                      {field.state.value === i && (
                        <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded tracking-tighter pointer-events-none">
                          {t('game.dealer')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="baseScore" className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('setup.base_score')}
          </Label>
          <form.Field
            name="baseScore"
            children={(field) => (
              <Input
                id="baseScore"
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-12 text-lg font-bold text-slate-900 dark:text-white"
              />
            )}
          />
        </div>

        <Button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg uppercase tracking-wide transition-all shadow-xl shadow-indigo-500/20 rounded-2xl">
          {t('setup.start_game')}
        </Button>
      </form>
    </div>
  );
}
