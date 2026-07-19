import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { History, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { gameStore, resetGame } from "../../store/game-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PlayerDetailsModal } from "./player-details-modal";
import { RoundModal } from "./round-modal";

export function GameDashboard() {
  const { t } = useTranslation();
  const state = useSelector(gameStore, (s) => s);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  if (!state) return null;

  const handleEndSession = () => {
    if (window.confirm(t("game.confirm_end"))) {
      resetGame();
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-700">
      {/* Header Info - Recreating PWA Style */}
      <div className="flex items-stretch justify-between gap-4">
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
            {t("game.round")}
          </span>
          <span className="text-3xl font-black text-indigo-500">
            {state.roundNum}
          </span>
        </div>
        <div className="relative flex flex-[2] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
            {t("game.dealer")}
          </span>
          <span className="max-w-full truncate text-xl font-black text-slate-900 dark:text-white">
            {state.players[state.dealerIndex].name}
          </span>
          {state.currentStreakCount > 0 && (
            <div className="absolute -top-2 -right-2">
              <Badge className="border-none bg-emerald-500 px-2 text-xs font-black text-white shadow-lg">
                {t("game.lian")} {state.currentStreakCount}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Scoreboard Grid - Recreating PWA Style */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
          {state.players.map((player, i) => {
            const points = player.history.reduce((a, b) => a + b, 0);
            const isDealer = i === state.dealerIndex;
            const winCount = state.roundHistory.filter(
              (r) => r.winnerIndex === i,
            ).length;
            const totalRounds = state.roundHistory.length;
            const winRate =
              totalRounds > 0 ? Math.round((winCount / totalRounds) * 100) : 0;

            return (
              <button
                key={i}
                onClick={() => setSelectedPlayerIndex(i)}
                className={`flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/50 dark:active:bg-slate-800 ${
                  isDealer ? "bg-indigo-50/30 dark:bg-indigo-500/5" : ""
                }`}
                title={t("game.view_chart")}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-black ${
                        isDealer
                          ? "text-indigo-500"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {player.name}
                    </span>
                    {isDealer && (
                      <Badge className="h-4 border-none bg-indigo-500 px-1.5 py-0 text-xs leading-4 font-black text-white">
                        {t("game.dealer")}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {t("game.win_rate")}: {winRate}%
                  </span>
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-16 w-full rounded-2xl bg-indigo-600 text-xl font-black tracking-wide text-white uppercase shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500"
        >
          {t("game.end_round")}
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/history" })}
            className="h-12 flex-1 rounded-xl border-slate-200 bg-white text-xs font-bold tracking-widest text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400"
          >
            <History className="mr-2 h-4 w-4" />
            {t("game.history")}
          </Button>
          <Button
            variant="outline"
            onClick={handleEndSession}
            className="h-12 flex-1 rounded-xl border-slate-200 bg-white text-xs font-bold tracking-widest text-red-500 uppercase hover:bg-red-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("game.end_session")}
          </Button>
        </div>
      </div>

      <RoundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <PlayerDetailsModal
        playerIndex={selectedPlayerIndex}
        isOpen={selectedPlayerIndex !== null}
        onClose={() => setSelectedPlayerIndex(null)}
      />
    </div>
  );
}
