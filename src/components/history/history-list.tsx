import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { gameStore } from "../../store/game-store";
import type { RoundResult } from "../../types/game";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { EditRoundDialog } from "./edit-round-dialog";

export function HistoryList() {
  const { t } = useTranslation();
  const state = useSelector(gameStore, (s) => s);
  const navigate = useNavigate();
  const [editingRound, setEditingRound] = useState<RoundResult | null>(null);

  if (!state) return null;

  const reversedHistory = [...state.roundHistory].reverse();

  return (
    <div className="animate-in fade-in slide-in-from-left-4 space-y-6 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/" })}
          className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("game.history")}
        </h2>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="text-xs text-slate-500 italic dark:text-slate-400">
          {t("game.edit_disclaimer")}
        </p>
      </div>

      <div className="space-y-4">
        {reversedHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            {t("game.no_history")}
          </div>
        ) : (
          reversedHistory.map((round, idx) => (
            <Card
              key={round.roundNum}
              className="border-slate-200 bg-white/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40"
            >
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {t("game.round")} {round.roundNum}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-slate-300 text-xs text-slate-600 uppercase dark:border-slate-700 dark:text-slate-400"
                    >
                      x{round.multiplier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {state.players[round.winnerIndex].name}
                      </span>{" "}
                      {t("game.wins")}
                    </span>
                    {round.roundNum === state.roundHistory.length && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 dark:hover:bg-indigo-900/20"
                        onClick={() => setEditingRound(round)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Players Header Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] items-center gap-2">
                    <div />
                    {state.players.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="truncate text-center text-xs font-bold text-slate-400 uppercase dark:text-slate-500"
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>

                  {/* Score Change Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-100 py-2 dark:border-slate-800/50">
                    <div className="text-xs font-black tracking-tighter text-slate-400 uppercase dark:text-slate-600">
                      {t("game.score_change")}
                    </div>
                    {round.scoreChanges.map((change, pIdx) => (
                      <div
                        key={pIdx}
                        className={`text-center text-sm font-black ${change > 0 ? "text-emerald-500" : change < 0 ? "text-red-500" : "text-slate-300"}`}
                      >
                        {change > 0 ? "+" : ""}
                        {change}
                      </div>
                    ))}
                  </div>

                  {/* Field Points Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-100 py-2 dark:border-slate-800/50">
                    <div className="text-xs font-black tracking-tighter text-slate-400 uppercase dark:text-slate-600">
                      {t("game.field_points_short")}
                    </div>
                    {round.fieldPoints.map((pts, pIdx) => (
                      <div
                        key={pIdx}
                        className="text-center text-sm font-bold text-slate-600 dark:text-slate-400"
                      >
                        {pts}
                      </div>
                    ))}
                  </div>

                  {/* Total Score Row */}
                  <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] items-center gap-2 py-2">
                    <div className="text-xs font-black tracking-tighter text-indigo-400 uppercase dark:text-indigo-600">
                      {t("game.total_score")}
                    </div>
                    {round.scoresAfter.map((total, pIdx) => (
                      <div
                        key={pIdx}
                        className="text-center text-sm font-black text-slate-900 dark:text-white"
                      >
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
