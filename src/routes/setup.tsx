import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { startGame } from '../store/game-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

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
          {t('common.app_tracker').includes('Mahjong') ? (
            <>Mahjong<span className="text-indigo-500">Tracker</span></>
          ) : (
            t('common.app_tracker')
          )}
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
            <span className="text-xs text-slate-400 font-normal">{t('setup.order_disclaimer')}</span>
          </div>

          <div className="space-y-2">
            <form.Field
              name="initialDealer"
              children={(field) => (
                <RadioGroup 
                  value={field.state.value.toString()} 
                  onValueChange={(val) => field.handleChange(Number(val))}
                  className="space-y-2 gap-0"
                >
                  {form.state.values.players.map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        field.state.value === i
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
                      }`}
                    >
                      <Label 
                        htmlFor={`dealer-${i}`}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <RadioGroupItem
                          value={i.toString()}
                          id={`dealer-${i}`}
                          className="data-[state=checked]:border-indigo-500 data-[state=checked]:text-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-400 w-4 text-center">
                          {i + 1}
                        </span>
                      </Label>
                      
                      <form.Field
                        name={`players[${i}]` as any}
                        children={(playerField) => (
                          <Input
                            placeholder={t('setup.player_placeholder', { index: i + 1 })}
                            value={playerField.state.value}
                            onChange={(e) => playerField.handleChange(e.target.value)}
                            className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none p-0 h-auto text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 rounded-none"
                          />
                        )}
                      />
                      {field.state.value === i && (
                        <span className="text-xs font-black bg-indigo-500 text-white px-2 py-0.5 rounded tracking-tighter">
                          {t('game.dealer')}
                        </span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
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
