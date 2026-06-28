import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RoundResult } from "../../types/game";

interface ScoreChartProps {
  playerName: string;
  playerIndex: number;
  roundHistory: RoundResult[];
}

interface TooltipData {
  x: number;
  y: number;
  round: number;
  change: number;
  cumulative: number;
}

// Chart layout constants
const VIEWBOX_W = 400;
const VIEWBOX_H = 220;
const PADDING = { top: 28, right: 20, bottom: 56, left: 58 };
const CHART_W = VIEWBOX_W - PADDING.left - PADDING.right;
const CHART_H = VIEWBOX_H - PADDING.top - PADDING.bottom;

function getSegmentColor(
  from: number,
  to: number,
  isChineseLocale: boolean,
): string {
  if (to > from) {
    return isChineseLocale ? "#ef4444" : "#22c55e"; // rise: red in ZH, green in EN
  }
  if (to < from) {
    return isChineseLocale ? "#22c55e" : "#ef4444"; // drop: green in ZH, red in EN
  }
  return "#94a3b8"; // flat → slate
}

export function ScoreChart({
  playerName,
  playerIndex,
  roundHistory,
}: ScoreChartProps) {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === "zh";
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (roundHistory.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="text-center text-sm text-slate-400 dark:text-slate-500">
          {t("game.no_chart_data")}
        </p>
      </div>
    );
  }

  // Build cumulative score series starting from 0 at round 0
  const points: { round: number; score: number; change: number }[] = [
    { round: 0, score: 0, change: 0 },
  ];
  let cumulative = 0;
  for (const r of roundHistory) {
    const change = r.scoreChanges[playerIndex];
    cumulative += change;
    points.push({ round: r.roundNum, score: cumulative, change });
  }

  // Y scale — compute "nice" tick boundaries
  const scores = points.map((p) => p.score);
  const rawMin = Math.min(...scores);
  const rawMax = Math.max(...scores);

  // Pick a nice step size so ticks land on round numbers (5, 10, 15, 20…)
  const TARGET_TICKS = 5;
  const rawRange = Math.max(rawMax - rawMin, 1);
  const rawStep = rawRange / (TARGET_TICKS - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const niceMultiplier =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceMultiplier * magnitude;

  // Snap min/max outward to multiples of step, always include 0
  const niceMin = Math.min(Math.floor(rawMin / step) * step, 0);
  const niceMax = Math.max(Math.ceil(rawMax / step) * step, 0);

  // Build tick array from niceMin to niceMax
  const yTicks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.001; v += step) {
    yTicks.push(Math.round(v));
  }

  const yMin = niceMin;
  const yMax = niceMax;
  const yRange = yMax - yMin;

  // X scale
  const xCount = points.length - 1; // number of gaps
  const toSvgX = (roundIdx: number) =>
    PADDING.left + (roundIdx / Math.max(xCount, 1)) * CHART_W;
  const toSvgY = (score: number) =>
    PADDING.top + ((yMax - score) / yRange) * CHART_H;

  // Y=0 line
  const zeroY = toSvgY(0);

  // X-axis label step: show every 1 if ≤ 10 rounds, else every 5
  const xLabelStep = points.length > 11 ? 5 : 1;

  return (
    <div className="space-y-2">
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="h-auto w-full"
          aria-label={`${playerName} score progression chart`}
        >
          {/* Y-axis grid lines & ticks */}
          {yTicks.map((tick) => {
            const ty = toSvgY(tick);
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  y1={ty}
                  x2={PADDING.left + CHART_W}
                  y2={ty}
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                  className="dark:stroke-slate-800"
                />
                <text
                  x={PADDING.left - 6}
                  y={ty + 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y=0 dotted red baseline */}
          {zeroY >= PADDING.top && zeroY <= PADDING.top + CHART_H && (
            <line
              x1={PADDING.left}
              y1={zeroY}
              x2={PADDING.left + CHART_W}
              y2={zeroY}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          )}

          {/* X-axis base line */}
          <line
            x1={PADDING.left}
            y1={PADDING.top + CHART_H}
            x2={PADDING.left + CHART_W}
            y2={PADDING.top + CHART_H}
            stroke="#e2e8f0"
            strokeWidth="1"
            className="dark:stroke-slate-800"
          />

          {/* X-axis round labels */}
          {points.map((p, idx) => {
            if (idx % xLabelStep !== 0 && idx !== points.length - 1) return null;
            const tx = toSvgX(idx);
            return (
              <text
                key={`xlabel-${idx}`}
                x={tx}
                y={PADDING.top + CHART_H + 14}
                textAnchor="middle"
                fontSize="8"
                fill="#94a3b8"
              >
                {p.round}
              </text>
            );
          })}

          {/* X-axis label: "Rounds" */}
          <text
            x={PADDING.left + CHART_W / 2}
            y={VIEWBOX_H - 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#64748b"
            letterSpacing="0.5"
          >
            {isZh ? "回合" : "Rounds"}
          </text>

          {/* Y-axis label: "Score" — rotated */}
          <text
            x={0}
            y={0}
            transform={`rotate(-90) translate(${-(PADDING.top + CHART_H / 2)}, 13)`}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#64748b"
            letterSpacing="0.5"
          >
            {isZh ? "分数" : "Score"}
          </text>

          {/* Colored line segments */}
          {points.map((p, idx) => {
            if (idx === 0) return null;
            const prev = points[idx - 1];
            const x1 = toSvgX(idx - 1);
            const y1 = toSvgY(prev.score);
            const x2 = toSvgX(idx);
            const y2 = toSvgY(p.score);
            const color = getSegmentColor(prev.score, p.score, isZh);
            return (
              <line
                key={`seg-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Data-point dots with score labels */}
          {points.map((p, idx) => {
            const cx = toSvgX(idx);
            const cy = toSvgY(p.score);
            const dotColor =
              idx === 0
                ? "#94a3b8"
                : getSegmentColor(points[idx - 1].score, p.score, isZh);

            // Place label above the dot; flip below if too close to top edge
            const labelY =
              cy - 10 < PADDING.top ? cy + 18 : cy - 10;

            return (
              <g key={`dot-${idx}`}>
                {/* Score label — skip the origin point */}
                {idx > 0 && (
                  <text
                    x={cx}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="bold"
                    fill={dotColor}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {p.score}
                  </text>
                )}
                {/* Invisible larger hit-target */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="transparent"
                  onMouseEnter={() =>
                    setTooltip({ x: cx, y: cy, round: p.round, change: p.change, cumulative: p.score })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-pointer"
                />
                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill={dotColor}
                  stroke="white"
                  strokeWidth="1.5"
                  className="dark:stroke-slate-900"
                />
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const tipW = 96;
            const tipH = 46;
            // Clamp tooltip horizontally
            const tipX = Math.min(
              Math.max(tooltip.x - tipW / 2, PADDING.left),
              PADDING.left + CHART_W - tipW,
            );
            const tipY =
              tooltip.y - tipH - 10 < PADDING.top
                ? tooltip.y + 12
                : tooltip.y - tipH - 10;

            return (
              <g>
                <rect
                  x={tipX}
                  y={tipY}
                  width={tipW}
                  height={tipH}
                  rx="6"
                  fill="#1e293b"
                  opacity="0.92"
                />
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                >
                  {tooltip.round === 0
                    ? "Start"
                    : t("game.round_label", { num: tooltip.round })}
                </text>
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 27}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="white"
                >
                  {t("game.cumulative_score")}: {tooltip.cumulative}
                </text>
                {tooltip.round > 0 && (
                  <text
                    x={tipX + tipW / 2}
                    y={tipY + 40}
                    textAnchor="middle"
                    fontSize="9"
                    fill={
                      tooltip.change > 0
                        ? isZh ? "#ef4444" : "#22c55e"
                        : tooltip.change < 0
                          ? isZh ? "#22c55e" : "#ef4444"
                          : "#94a3b8"
                    }
                  >
                    {tooltip.change > 0 ? "+" : ""}
                    {tooltip.change}
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

    </div>
  );
}
