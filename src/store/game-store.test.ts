import { beforeEach, describe, expect, it } from "vitest";
import {
  addRound,
  deleteRound,
  gameStore,
  renamePlayer,
  resetGame,
  startGame,
  updateRound,
} from "./game-store";

describe("gameStore", () => {
  beforeEach(() => {
    resetGame();
  });

  it("should initialize game state", () => {
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
    const state = gameStore.state;
    expect(state).not.toBeNull();
    expect(state?.players.map((p) => p.name)).toEqual([
      "Alice",
      "Bob",
      "Charlie",
      "David",
    ]);
    expect(state?.baseScore).toBe(5);
    expect(state?.dealerIndex).toBe(0);
  });

  it("should rename a player correctly", () => {
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
    renamePlayer(1, "Robert");

    const state = gameStore.state;
    expect(state?.players[1].name).toBe("Robert");
    // Other players should remain unchanged
    expect(state?.players[0].name).toBe("Alice");
    expect(state?.players[2].name).toBe("Charlie");
    expect(state?.players[3].name).toBe("David");
  });

  it("should not crash or rename if state is null", () => {
    renamePlayer(1, "Robert");
    expect(gameStore.state).toBeNull();
  });

  it("should not rename if index is out of bounds", () => {
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
    renamePlayer(4, "Invalid");
    renamePlayer(-1, "Invalid");

    const state = gameStore.state;
    expect(state?.players.map((p) => p.name)).toEqual([
      "Alice",
      "Bob",
      "Charlie",
      "David",
    ]);
  });

  it("should integrate player renaming correctly with round actions (adding, editing, and deleting rounds)", () => {
    // 1. Start game
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);

    // 2. Rename Bob to Robert
    renamePlayer(1, "Robert");

    // 3. Add a round (Robert wins, x1 multiplier, no field points)
    addRound(1, 1, [0, 0, 0, 0]);

    // Robert should have won
    let state = gameStore.state;
    expect(state?.roundHistory[0].winnerIndex).toBe(1);
    expect(state?.players[1].name).toBe("Robert");

    // 4. Rename Alice to Alyson
    renamePlayer(0, "Alyson");
    state = gameStore.state;
    expect(state?.players[0].name).toBe("Alyson");

    // 5. Update round 1 (Alyson wins, x2 multiplier, 0 field points)
    updateRound(1, 0, 2, [0, 0, 0, 0]);
    state = gameStore.state;
    expect(state?.roundHistory[0].winnerIndex).toBe(0);
    expect(state?.roundHistory[0].multiplier).toBe(2);
    expect(state?.players[0].name).toBe("Alyson");
    expect(state?.players[1].name).toBe("Robert");

    // 6. Delete the round
    deleteRound(1);
    state = gameStore.state;
    expect(state?.roundHistory).toHaveLength(0);
    expect(state?.players[0].name).toBe("Alyson");
    expect(state?.players[1].name).toBe("Robert");
  });
});
