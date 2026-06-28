// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gameStore, resetGame, startGame } from "../../store/game-store";
import { GameDashboard } from "./game-dashboard";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === "setup.player_placeholder") {
        return `Player ${options?.index}`;
      }
      return key;
    },
  }),
}));

describe("GameDashboard UI - Renaming Players", () => {
  beforeEach(() => {
    resetGame();
    // Start game with 4 players, base score 5, player 0 is dealer
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
  });

  it("should render player names and open renaming dialog on click", () => {
    render(<GameDashboard />);

    // 1. Verify player names are rendered
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();

    // 2. Click Bob's name to rename
    const bobButton = screen.getByRole("button", { name: /Bob/i });
    fireEvent.click(bobButton);

    // 3. Verify dialog is open (shows rename_player title and input field)
    expect(screen.getByText("game.rename_player")).toBeTruthy();
    const input = screen.getByLabelText("game.new_name_label") as HTMLInputElement;
    expect(input.value).toBe("Bob");

    // 4. Change name to Robert and save
    fireEvent.change(input, { target: { value: "Robert" } });
    const saveButton = screen.getByRole("button", { name: "game.save" });
    fireEvent.click(saveButton);

    // 5. Verify Bob is renamed to Robert in store and UI
    expect(gameStore.state?.players[1].name).toBe("Robert");
    expect(screen.queryByText("Bob")).toBeNull();
    expect(screen.getByText("Robert")).toBeTruthy();
  });
});
