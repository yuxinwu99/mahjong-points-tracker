import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { startGame } from '../store/game-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
      // Fill in default names if empty
      const names = value.players.map((name, i) => name.trim() || t('setup.player_placeholder', { index: i + 1 }));
      startGame(names, value.baseScore, value.initialDealer);
      navigate({ to: '/' });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('setup.title')}</CardTitle>
          <CardDescription>{t('setup.order_disclaimer')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-base font-semibold">{t('setup.players')}</Label>
              {form.state.values.players.map((_, i) => (
                <form.Field
                  key={i}
                  name={`players[${i}]` as any}
                  children={(field) => (
                    <div className="space-y-1">
                      <Input
                        placeholder={t('setup.player_placeholder', { index: i + 1 })}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-neutral-950 border-neutral-800 focus:ring-indigo-500/50"
                      />
                    </div>
                  )}
                />
              ))}
            </div>

            <div className="space-y-4">
              <form.Field
                name="baseScore"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="baseScore" className="text-base font-semibold">
                      {t('setup.base_score')}
                    </Label>
                    <Input
                      id="baseScore"
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="bg-neutral-950 border-neutral-800"
                    />
                  </div>
                )}
              />
            </div>

            <div className="space-y-4">
              <form.Field
                name="initialDealer"
                children={(field) => (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">{t('setup.initial_dealer')}</Label>
                    <RadioGroup
                      value={field.state.value.toString()}
                      onValueChange={(val) => field.handleChange(parseInt(val))}
                      className="grid grid-cols-2 gap-2"
                    >
                      {form.state.values.players.map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <RadioGroupItem value={i.toString()} id={`dealer-${i}`} className="border-neutral-700" />
                          <Label htmlFor={`dealer-${i}`} className="text-sm font-normal cursor-pointer">
                             {form.state.values.players[i] || t('setup.player_placeholder', { index: i + 1 })}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20">
              {t('setup.start_game')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
