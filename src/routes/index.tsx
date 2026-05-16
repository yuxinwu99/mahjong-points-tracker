import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { gameStore } from '../store/game-store';
import { GameDashboard } from '../components/game/game-dashboard';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const gameState = useStore(gameStore);

  if (!gameState) {
    return <Navigate to="/setup" />;
  }

  return <GameDashboard />;
}
