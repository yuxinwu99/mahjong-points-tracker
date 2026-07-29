// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import * as React from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { gameStore, resetGame, startGame, addRound } from "../../store/game-store";
import { GameDashboard } from "./game-dashboard";

let mockLanguage = "en";

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
    i18n: { language: mockLanguage },
  }),
}));

describe("GameDashboard UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
    resetGame();
    // Start game with 4 players, base score 5, player 0 (Alice) is dealer
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
  });

  afterEach(() => {
    cleanup();
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

  it("should show/hide and increment the dealer streak badge correctly", () => {
    // 1. Initial State: Alice is dealer with 0 wins. No streak badge should be shown.
    const { rerender } = render(<GameDashboard />);
    expect(screen.queryByText(/game.lian/)).toBeNull();

    // 2. Alice (dealer, index 0) wins round 1.
    // addRound(winnerIndex, multiplier, fieldPoints)
    addRound(0, 1, [0, 0, 0, 0]);
    rerender(<GameDashboard />);

    // Alice is still dealer and should have streak 1 (shown as "game.lian 1")
    expect(screen.getByText("game.lian 1")).toBeTruthy();

    // 3. Alice wins again.
    addRound(0, 1, [0, 0, 0, 0]);
    rerender(<GameDashboard />);

    // Alice is still dealer and should have streak 2 (shown as "game.lian 2")
    expect(screen.getByText("game.lian 2")).toBeTruthy();

    // 4. Bob (non-dealer, index 1) wins round 3. Dealer rotates to Bob.
    // Since Bob just became dealer, streak resets to 0 (badge disappears).
    addRound(1, 1, [0, 0, 0, 0]);
    rerender(<GameDashboard />);
    expect(screen.queryByText(/game.lian/)).toBeNull();
  });

  describe("Scoreboard Colors by Locale", () => {
    beforeEach(() => {
      // Alice (winner) gets positive points, others (losers) get negative points.
      // Dealer = Alice (index 0). Base score = 5.
      // Alice gets payout from each player. Alice will have positive score.
      addRound(0, 1, [0, 0, 0, 0]);
    });

    it("should render positive points as green and negative points as red in EN locale", () => {
      mockLanguage = "en";
      render(<GameDashboard />);
      const playerButtons = screen.getAllByTitle("game.view_chart");
      
      // Alice (index 0) has positive points
      const aliceScoreSpan = playerButtons[0].querySelector("span.tabular-nums");
      expect(aliceScoreSpan).toBeTruthy();
      expect(aliceScoreSpan?.className).toContain("text-emerald-500");
      expect(aliceScoreSpan?.className).not.toContain("text-red-500");

      // Bob (index 1) has negative points
      const bobScoreSpan = playerButtons[1].querySelector("span.tabular-nums");
      expect(bobScoreSpan).toBeTruthy();
      expect(bobScoreSpan?.className).toContain("text-red-500");
      expect(bobScoreSpan?.className).not.toContain("text-emerald-500");
    });

    it("should render positive points as red and negative points as green in ZH locale", () => {
      mockLanguage = "zh";
      render(<GameDashboard />);
      const playerButtons = screen.getAllByTitle("game.view_chart");

      // Alice (index 0) has positive points
      const aliceScoreSpan = playerButtons[0].querySelector("span.tabular-nums");
      expect(aliceScoreSpan).toBeTruthy();
      expect(aliceScoreSpan?.className).toContain("text-red-500");
      expect(aliceScoreSpan?.className).not.toContain("text-emerald-500");

      // Bob (index 1) has negative points
      const bobScoreSpan = playerButtons[1].querySelector("span.tabular-nums");
      expect(bobScoreSpan).toBeTruthy();
      expect(bobScoreSpan?.className).toContain("text-emerald-500");
      expect(bobScoreSpan?.className).not.toContain("text-red-500");
    });
  });
});

