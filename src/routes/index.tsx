import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { gameStore } from '../store/game-store';
import { GameDashboard } from '../components/game/game-dashboard';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const gameState = useSelector(gameStore, (state) => state);

  if (!gameState) {
    return <Navigate to="/setup" />;
  }

  return <GameDashboard />;
}
