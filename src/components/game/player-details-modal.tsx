import { Edit2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { gameStore } from "../../store/game-store";
import { useSelector } from "@tanstack/react-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { RenamePlayerDialog } from "./rename-player-dialog";
import { ScoreChart } from "./score-chart";

interface PlayerDetailsModalProps {
  playerIndex: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerDetailsModal({
  playerIndex,
  isOpen,
  onClose,
}: PlayerDetailsModalProps) {
  const { t } = useTranslation();
  const state = useSelector(gameStore, (s) => s);
  const [isRenaming, setIsRenaming] = useState(false);

  if (!state || playerIndex === null) return null;

  const player = state.players[playerIndex];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-3xl border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:max-w-lg">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <DialogTitle className="truncate text-xl font-black text-slate-900 dark:text-white">
                {player.name}
              </DialogTitle>
              <button
                onClick={() => setIsRenaming(true)}
                title={t("game.rename_player")}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </DialogHeader>

          {/* Chart body */}
          <div className="px-6 py-5">
            <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
              {t("game.score_chart")}
            </p>
            <ScoreChart
              playerName={player.name}
              playerIndex={playerIndex}
              roundHistory={state.roundHistory}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested rename dialog — opens on top of the details modal */}
      <RenamePlayerDialog
        playerIndex={playerIndex}
        currentName={player.name}
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
      />
    </>
  );
}
