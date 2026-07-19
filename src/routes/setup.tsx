import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Switch } from "../components/ui/switch";
import { startGame } from "../store/game-store";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      players: ["", "", "", ""],
      baseScore: 5,
      initialDealer: 0,
      enableStreakCap: true,
      streakCap: 40,
    },
    onSubmit: async ({ value }) => {
      const names = value.players.map(
        (name, i) =>
          name.trim() || t("setup.player_placeholder", { index: i + 1 }),
      );
      const cap = value.enableStreakCap ? value.streakCap : null;
      startGame(names, value.baseScore, value.initialDealer, cap);
      navigate({ to: "/" });
    },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-md space-y-8 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic dark:text-white">
          {t("common.app_tracker").includes("Mahjong") ? (
            <>
              Mahjong<span className="text-indigo-500">Tracker</span>
            </>
          ) : (
            t("common.app_tracker")
          )}
        </h1>
        <p className="font-medium text-slate-500 dark:text-slate-400">
          {t("setup.title")}
        </p>
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
            <Label className="text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {t("setup.players")}
            </Label>
            <span className="text-xs font-normal text-slate-400">
              {t("setup.order_disclaimer")}
            </span>
          </div>

          <div className="space-y-2">
            <form.Field
              name="initialDealer"
              children={(field) => (
                <RadioGroup
                  value={field.state.value.toString()}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  className="gap-0 space-y-2"
                >
                  {form.state.values.players.map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        field.state.value === i
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                      }`}
                    >
                      <Label
                        htmlFor={`dealer-${i}`}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem
                          value={i.toString()}
                          id={`dealer-${i}`}
                          className="cursor-pointer data-[state=checked]:border-indigo-500 data-[state=checked]:text-indigo-500"
                        />
                        <span className="w-4 text-center text-xs font-bold text-slate-400">
                          {i + 1}
                        </span>
                      </Label>

                      <form.Field
                        name={`players[${i}]` as any}
                        children={(playerField) => (
                          <Input
                            placeholder={t("setup.player_placeholder", {
                              index: i + 1,
                            })}
                            value={playerField.state.value}
                            onChange={(e) =>
                              playerField.handleChange(e.target.value)
                            }
                            className="h-auto flex-1 rounded-none border-none bg-transparent p-0 font-semibold text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-white"
                          />
                        )}
                      />
                      {field.state.value === i && (
                        <span className="rounded bg-indigo-500 px-2 py-0.5 text-xs font-black tracking-tighter text-white">
                          {t("game.dealer")}
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
          <Label
            htmlFor="baseScore"
            className="text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
          >
            {t("setup.base_score")}
          </Label>
          <form.Field
            name="baseScore"
            children={(field) => (
              <Input
                id="baseScore"
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="h-12 border-slate-200 bg-white text-lg font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            )}
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <Label className="text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {t("setup.limit_streak_cap")}
              </Label>
              <p className="text-xs text-slate-400 font-normal">
                {t("setup.limit_streak_cap_help")}
              </p>
            </div>
            <form.Field
              name="enableStreakCap"
              children={(field) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              )}
            />
          </div>

          {form.state.values.enableStreakCap && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-2 duration-300">
              <Label
                htmlFor="streakCap"
                className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                {t("setup.streak_cap_value")}
              </Label>
              <form.Field
                name="streakCap"
                children={(field) => (
                  <Input
                    id="streakCap"
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="h-12 border-slate-200 bg-white text-base font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                )}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="h-14 w-full rounded-2xl bg-indigo-600 text-lg font-black tracking-wide text-white uppercase shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500"
        >
          {t("setup.start_game")}
        </Button>
      </form>
    </div>
  );
}
