import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { History, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { gameStore, resetGame } from "../../store/game-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { RoundModal } from "./round-modal";

export function GameDashboard() {
  const { t } = useTranslation();
  const state = useSelector(gameStore, (s) => s);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!state) return null;

  const handleEndSession = () => {
    if (window.confirm(t("game.confirm_end"))) {
      resetGame();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Info - Recreating PWA Style */}
      <div className="flex justify-between items-stretch gap-4">
        <div className="flex-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("game.round")}
          </span>
          <span className="text-3xl font-black text-indigo-500">
            {state.roundNum}
          </span>
        </div>
        <div className="flex-[2] bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative flex flex-col items-center justify-center">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("game.dealer")}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white truncate max-w-full">
            {state.players[state.dealerIndex].name}
          </span>
          {state.currentStreakCount > 1 && (
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-emerald-500 text-white font-black text-xs border-none px-2 shadow-lg">
                {t("game.lian")} {state.currentStreakCount - 1}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Scoreboard Grid - Recreating PWA Style */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10">
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
          {state.players.map((player, i) => {
            const points = player.history.reduce((a, b) => a + b, 0);
            const isDealer = i === state.dealerIndex;

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-6 transition-colors ${
                  isDealer ? "bg-indigo-50/30 dark:bg-indigo-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-black ${isDealer ? "text-indigo-500" : "text-slate-400"}`}
                  >
                    {player.name}
                  </span>
                  {isDealer && (
                    <Badge className="bg-indigo-500 text-white font-black text-xs border-none py-0 px-1.5 leading-4 h-4">
                      {t("game.dealer")}
                    </Badge>
                  )}
                </div>
                <span
                  className={`text-2xl font-black tabular-nums ${
                    points > 0
                      ? "text-emerald-500"
                      : points < 0
                        ? "text-red-500"
                        : "text-slate-900 dark:text-white"
                  }`}
                >
                  {points}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl uppercase tracking-wide transition-all shadow-xl shadow-indigo-500/20 rounded-2xl"
        >
          {t("game.end_round")}
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/history" })}
            className="flex-1 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest rounded-xl"
          >
            <History className="mr-2 w-4 h-4" />
            {t("game.history")}
          </Button>
          <Button
            variant="outline"
            onClick={handleEndSession}
            className="flex-1 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-red-500 dark:text-red-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="mr-2 w-4 h-4" />
            {t("game.end_session")}
          </Button>
        </div>
      </div>

      <RoundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
