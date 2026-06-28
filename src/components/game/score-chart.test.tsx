// @vitest-environment jsdom
import { render } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoundResult } from "../../types/game";
import { ScoreChart } from "./score-chart";

// Mock react-i18next so we can control the language
const mockT = (key: string, options?: any) => {
  if (key === "game.round_label") return `R${options?.num}`;
  if (key === "game.cumulative_score") return "Score";
  if (key === "game.no_chart_data") return "No rounds played yet.";
  return key;
};

let mockLanguage = "en";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: mockLanguage },
  }),
}));

// Helper to build mock round history
function makeRoundHistory(scoreChanges: number[][]): RoundResult[] {
  const results: RoundResult[] = [];
  const cumulative = [0, 0, 0, 0];
  for (let i = 0; i < scoreChanges.length; i++) {
    const changes = scoreChanges[i];
    changes.forEach((c, pi) => (cumulative[pi] += c));
    results.push({
      roundNum: i + 1,
      dealerIndex: 0,
      winnerIndex: 0,
      multiplier: 1,
      fieldPoints: [0, 0, 0, 0],
      scoreChanges: changes,
      scoresAfter: [...cumulative],
    });
  }
  return results;
}

describe("ScoreChart", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it("renders empty state when no rounds have been played", () => {
    const { getByText } = render(
      <ScoreChart playerName="Alice" playerIndex={0} roundHistory={[]} />,
    );
    expect(getByText("No rounds played yet.")).toBeTruthy();
  });

  it("renders the SVG chart when rounds exist", () => {
    const history = makeRoundHistory([
      [10, -5, -3, -2],
      [-15, 5, 5, 5],
    ]);
    const { container } = render(
      <ScoreChart playerName="Alice" playerIndex={0} roundHistory={history} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders the Y=0 baseline with red dotted style", () => {
    const history = makeRoundHistory([[10, -5, -3, -2]]);
    const { container } = render(
      <ScoreChart playerName="Alice" playerIndex={0} roundHistory={history} />,
    );
    // The zero baseline should have stroke="#ef4444" and strokeDasharray="4 4"
    const lines = container.querySelectorAll("line");
    const zeroLine = Array.from(lines).find(
      (l) =>
        l.getAttribute("stroke") === "#ef4444" &&
        l.getAttribute("stroke-dasharray") === "4 4",
    );
    expect(zeroLine).toBeTruthy();
  });

  describe("EN locale: rise=green, drop=red", () => {
    it("uses green (#22c55e) for a rising segment", () => {
      mockLanguage = "en";
      // Player 0 gains 10 points in round 1 (rise from 0 to 10)
      const history = makeRoundHistory([[10, -5, -3, -2]]);
      const { container } = render(
        <ScoreChart playerName="Alice" playerIndex={0} roundHistory={history} />,
      );
      const coloredLines = Array.from(container.querySelectorAll("line")).filter(
        (l) =>
          l.getAttribute("stroke") === "#22c55e" ||
          l.getAttribute("stroke") === "#ef4444",
      );
      const greenLines = coloredLines.filter(
        (l) => l.getAttribute("stroke") === "#22c55e",
      );
      expect(greenLines.length).toBeGreaterThan(0);
    });

    it("uses red (#ef4444) for a falling segment", () => {
      mockLanguage = "en";
      // Player 0 loses 10 points in round 1 (drop from 0 to -10)
      const history = makeRoundHistory([[-10, 5, 3, 2]]);
      const { container } = render(
        <ScoreChart playerName="Alice" playerIndex={0} roundHistory={history} />,
      );
      const coloredLines = Array.from(container.querySelectorAll("line")).filter(
        (l) =>
          l.getAttribute("stroke") === "#22c55e" ||
          l.getAttribute("stroke") === "#ef4444",
      );
      const redLines = coloredLines.filter(
        (l) => l.getAttribute("stroke") === "#ef4444",
      );
      // At least one red segment (the falling one); zero-baseline is also red but dashed
      const solidRedLines = redLines.filter(
        (l) => !l.getAttribute("stroke-dasharray"),
      );
      expect(solidRedLines.length).toBeGreaterThan(0);
    });
  });

  describe("ZH locale: rise=red, drop=green (inverted)", () => {
    it("uses red (#ef4444) for a rising segment", () => {
      mockLanguage = "zh";
      const history = makeRoundHistory([[10, -5, -3, -2]]);
      const { container } = render(
        <ScoreChart playerName="Alice" playerIndex={0} roundHistory={history} />,
      );
      // In ZH: rising segment → red solid line
      const solidColoredLines = Array.from(
        container.querySelectorAll("line"),
      ).filter(
        (l) =>
          (l.getAttribute("stroke") === "#ef4444" ||
            l.getAttribute("stroke") === "#22c55e") &&
          !l.getAttribute("stroke-dasharray"),
      );
      const redSolid = solidColoredLines.filter(
        (l) => l.getAttribute("stroke") === "#ef4444",
      );
      expect(redSolid.length).toBeGreaterThan(0);
    });

    it("uses green (#22c55e) for a falling segment", () => {
      mockLanguage = "zh";
      const history = makeRoundHistory([[-10, 5, 3, 2]]);
      const { container } = render(
        <ScoreChart playerName="Alice" playerIndex={0} roundHistory={history} />,
      );
      const solidColoredLines = Array.from(
        container.querySelectorAll("line"),
      ).filter(
        (l) =>
          (l.getAttribute("stroke") === "#ef4444" ||
            l.getAttribute("stroke") === "#22c55e") &&
          !l.getAttribute("stroke-dasharray"),
      );
      const greenSolid = solidColoredLines.filter(
        (l) => l.getAttribute("stroke") === "#22c55e",
      );
      expect(greenSolid.length).toBeGreaterThan(0);
    });
  });
});
