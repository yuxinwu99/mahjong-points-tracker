import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { gameStore } from '../store/game-store';
import { HistoryList } from '../components/history/history-list';

export const Route = createFileRoute('/history')({
  component: HistoryPage,
});

function HistoryPage() {
  const gameState = useStore(gameStore);

  if (!gameState) {
    return <Navigate to="/setup" />;
  }

  return <HistoryList />;
}
