// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import * as React from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { resetGame, startGame, addRound } from "../../store/game-store";
import { HistoryList } from "./history-list";

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

describe("HistoryList UI Colors by Locale", () => {
  beforeEach(() => {
    mockLanguage = "en";
    resetGame();
    // Start game with 4 players, base score 5, player 0 (Alice) is dealer
    startGame(["Alice", "Bob", "Charlie", "David"], 5, 0);
    // Alice wins round 1. Alice has positive change, others have negative changes.
    addRound(0, 1, [0, 0, 0, 0]);
  });

  afterEach(() => {
    cleanup();
  });

  it("should render positive changes as green and negative changes as red in EN locale", () => {
    mockLanguage = "en";
    render(<HistoryList />);

    const scoreChangeHeader = screen.getByText("game.score_change");
    const scoreChangeRow = scoreChangeHeader.parentElement;
    const changeDivs = Array.from(scoreChangeRow?.children || []).slice(1);

    // Alice (index 0) is winner -> positive change
    expect(changeDivs[0].className).toContain("text-emerald-500");
    expect(changeDivs[0].className).not.toContain("text-red-500");

    // Bob (index 1) is loser -> negative change
    expect(changeDivs[1].className).toContain("text-red-500");
    expect(changeDivs[1].className).not.toContain("text-emerald-500");
  });

  it("should render positive changes as red and negative changes as green in ZH locale", () => {
    mockLanguage = "zh";
    render(<HistoryList />);

    const scoreChangeHeader = screen.getByText("game.score_change");
    const scoreChangeRow = scoreChangeHeader.parentElement;
    const changeDivs = Array.from(scoreChangeRow?.children || []).slice(1);

    // Alice (index 0) is winner -> positive change
    expect(changeDivs[0].className).toContain("text-red-500");
    expect(changeDivs[0].className).not.toContain("text-emerald-500");

    // Bob (index 1) is loser -> negative change
    expect(changeDivs[1].className).toContain("text-emerald-500");
    expect(changeDivs[1].className).not.toContain("text-red-500");
  });
});
