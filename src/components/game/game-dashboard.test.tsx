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
    i18n: { language: "en" },
  }),
}));

describe("GameDashboard UI", () => {
  beforeEach(() => {
    resetGame();
    // Start game with 4 players, base score 5, player 0 (Alice) is dealer
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
  });

  it("should render all player names in the scoreboard", () => {
    render(<GameDashboard />);

    // Alice appears at least twice (dealer header + scoreboard row)
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    // Others appear once each in the scoreboard
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Charlie")).toBeTruthy();
    expect(screen.getByText("David")).toBeTruthy();
  });

  it("should open PlayerDetailsModal when clicking a player row", () => {
    render(<GameDashboard />);

    // Click Bob's player row button (title attribute = game.view_chart)
    const playerButtons = screen.getAllByTitle("game.view_chart");
    // Player rows: Alice=0, Bob=1, Charlie=2, David=3
    fireEvent.click(playerButtons[1]); // Bob

    // Modal header should show Bob's name and the score chart section
    // The modal renders the score_chart translation key as a label
    expect(screen.getByText("game.score_chart")).toBeTruthy();
    // Bob's name appears in the modal title
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
  });

  it("should open RenamePlayerDialog from within PlayerDetailsModal", () => {
    render(<GameDashboard />);

    // Open Bob's details modal
    const playerButtons = screen.getAllByTitle("game.view_chart");
    fireEvent.click(playerButtons[1]); // Bob

    // Click the pencil/rename button inside the modal
    const renameButton = screen.getByTitle("game.rename_player");
    fireEvent.click(renameButton);

    // Rename dialog should open: shows rename_player title and input
    expect(screen.getByText("game.rename_player")).toBeTruthy();
    const input = screen.getByLabelText("game.new_name_label") as HTMLInputElement;
    expect(input.value).toBe("Bob");

    // Change name to Robert and save
    fireEvent.change(input, { target: { value: "Robert" } });
    const saveButton = screen.getByRole("button", { name: "game.save" });
    fireEvent.click(saveButton);

    // Verify Bob is renamed to Robert in store
    expect(gameStore.state?.players[1].name).toBe("Robert");
  });
});
