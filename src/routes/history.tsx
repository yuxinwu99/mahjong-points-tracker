import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { gameStore } from "../store/game-store";
import { HistoryList } from "../components/history/history-list";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const gameState = useSelector(gameStore, (state) => state);

  if (!gameState) {
    return <Navigate to="/setup" />;
  }

  return <HistoryList />;
}
