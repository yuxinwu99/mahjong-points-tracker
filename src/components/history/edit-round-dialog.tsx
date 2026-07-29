import { useForm } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-store";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { deleteRound, gameStore, updateRound } from "../../store/game-store";
import type { RoundResult } from "../../types/game";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";

interface EditRoundDialogProps {
  round: RoundResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRoundDialog({
  round,
  isOpen,
  onClose,
}: EditRoundDialogProps) {
  const { t } = useTranslation();
  const state = useSelector(gameStore, (s) => s);

  const form = useForm({
    defaultValues: {
      winnerIndex: round?.winnerIndex ?? -1,
      multiplier: round?.multiplier ?? 1,
      fieldPoints: round?.fieldPoints ? [...round.fieldPoints] : [0, 0, 0, 0],
    },
    onSubmit: async ({ value }) => {
      if (!round) return;
      if (value.winnerIndex === -1) {
        alert(t("game.select_winner"));
        return;
      }
      updateRound(
        round.roundNum,
        value.winnerIndex,
        value.multiplier,
        value.fieldPoints,
      );
      onClose();
    },
  });

  if (!state || !round) return null;

  const handleDelete = () => {
    if (confirm(t("game.confirm_delete"))) {
      deleteRound(round.roundNum);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-3xl overflow-hidden rounded-3xl border-none bg-white p-0 text-slate-900 sm:max-w-md dark:bg-slate-900 dark:text-slate-50">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
          <DialogTitle className="text-xl font-black tracking-tight uppercase">
            {t("game.edit_round")} {round.roundNum}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="max-h-[70vh] space-y-8 overflow-y-auto p-6"
        >
          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/20">
            <p className="text-xs leading-relaxed font-medium text-amber-700 dark:text-amber-400">
              {t("game.edit_disclaimer")}
            </p>
          </div>
          {/* Winner Selection */}
          <div className="space-y-4">
            <Label className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
              {t("game.who_won")}
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
                      className={`relative flex h-16 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 font-black transition-all ${
                        field.state.value === i
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                          : "border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600"
                      }`}
                    >
                      <span className="w-full truncate px-2 text-center text-sm">
                        {p.name}
                      </span>
                      {i === round.dealerIndex && (
                        <span
                          className={`mt-1 text-xs uppercase ${field.state.value === i ? "text-indigo-400" : "text-slate-500"}`}
                        >
                          {t("game.dealer")}
                        </span>
                      )}
                      {field.state.value === i && (
                        <div className="absolute top-0 right-0 p-1">
                          <div className="h-2 w-2 rounded-full bg-indigo-500" />
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
                <Label className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  {t("game.multiplier")}
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-slate-200 text-slate-900 dark:border-slate-800 dark:text-white"
                    onClick={() =>
                      field.handleChange(Math.max(1, field.state.value - 1))
                    }
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <div className="flex h-14 flex-1 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 text-2xl font-black text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                    {field.state.value}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-slate-200 text-slate-900 dark:border-slate-800 dark:text-white"
                    onClick={() => field.handleChange(field.state.value + 1)}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}
          />

          {/* Field Points */}
          <div className="space-y-4">
            <Label className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
              {t("game.field_points")}
            </Label>
            <div className="space-y-2">
              {state.players.map((p, i) => (
                <form.Field
                  key={i}
                  name={`fieldPoints[${i}]` as any}
                  children={(field) => (
                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {p.name}
                        </span>
                        {i === round.dealerIndex && (
                          <span className="text-xs font-black text-indigo-500">
                            ({t("game.dealer")})
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="h-9 w-20 rounded-lg border-none bg-white p-2 text-right font-black text-slate-900 focus:ring-0 dark:bg-slate-900 dark:text-white"
                        value={field.state.value}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, "");
                          field.handleChange(parseInt(cleaned) || 0);
                        }}
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
              className="h-14 flex-[2] rounded-2xl bg-indigo-600 text-lg font-black tracking-wide text-white uppercase shadow-xl shadow-indigo-500/20 hover:bg-indigo-500"
            >
              {t("game.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-14 flex-1 rounded-2xl border-slate-200 bg-white text-xs font-bold tracking-widest text-slate-400 uppercase dark:border-slate-800 dark:bg-slate-900"
            >
              {t("game.cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
