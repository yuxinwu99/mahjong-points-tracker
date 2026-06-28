import * as React from "react";
import { useTranslation } from "react-i18next";
import { renamePlayer } from "../../store/game-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface RenamePlayerDialogProps {
  playerIndex: number;
  currentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RenamePlayerDialog({
  playerIndex,
  currentName,
  isOpen,
  onClose,
}: RenamePlayerDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = React.useState(currentName);

  React.useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    renamePlayer(playerIndex, name.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="shadow-3xl overflow-hidden rounded-3xl border-none bg-white p-0 text-slate-900 sm:max-w-md dark:bg-slate-900 dark:text-slate-50">
        <DialogHeader className="border-b border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
          <DialogTitle className="text-xl font-black tracking-tight uppercase">
            {t("game.rename_player")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label
              htmlFor="player-name"
              className="text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500"
            >
              {t("game.new_name_label")}
            </Label>
            <Input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={currentName}
              autoFocus
              onFocus={(e) => e.target.select()}
              className="h-12 border-slate-200 bg-white text-lg font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!name.trim() || name.trim() === currentName}
              className="h-14 flex-[2] rounded-2xl bg-indigo-600 text-lg font-black tracking-wide text-white uppercase shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-50"
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
