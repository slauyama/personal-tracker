import { useMemo, useRef, useState } from "react";
import { Text } from "@slauyama/ui";
import { DogEventType } from "../../constants";
import type { DogEvent } from "../../hooks/useDogEvents";

interface DogWeightChartProps {
  events: DogEvent[];
  onEditWeight: (event: DogEvent) => void;
}

interface WeightPoint {
  event: DogEvent;
  date: string;
  weightLbs: number;
  t: number;
}

const WIDTH = 640;
const HEIGHT = 140;
const PADDING = { top: 16, right: 16, bottom: 24, left: 36 };
const LINE_COLOR = "#64748b"; // slate-500, matches the app's existing accent

function niceStep(range: number, targetTicks = 4): number {
  const rough = range / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough || 1)));
  const residual = rough / magnitude;
  if (residual > 5) return 10 * magnitude;
  if (residual > 2) return 5 * magnitude;
  if (residual > 1) return 2 * magnitude;
  return magnitude;
}

export default function DogWeightChart({
  events,
  onEditWeight,
}: DogWeightChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo<WeightPoint[]>(() => {
    return events
      .filter(
        (e): e is DogEvent & { weightLbs: number } =>
          e.type === DogEventType.Weight && e.weightLbs != null,
      )
      .map((e) => ({
        event: e,
        date: e.date,
        weightLbs: e.weightLbs,
        t: new Date(e.date).getTime(),
      }))
      .sort((a, b) => a.t - b.t);
  }, [events]);

  if (points.length === 0) {
    return (
      <div className="text-center py-10">
        <Text className="text-zinc-400">No weight entries yet</Text>
      </div>
    );
  }

  const minT = points[0].t;
  const maxT = points[points.length - 1].t;
  const minW = Math.min(...points.map((p) => p.weightLbs));
  const maxW = Math.max(...points.map((p) => p.weightLbs));
  const step = niceStep(maxW - minW || 1);
  const yMin = Math.floor(minW / step) * step - step * 0.25;
  const yMax = Math.ceil(maxW / step) * step + step * 0.25;

  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const xScale = (t: number) =>
    maxT === minT
      ? PADDING.left + chartW / 2
      : PADDING.left + ((t - minT) / (maxT - minT)) * chartW;
  const yScale = (w: number) =>
    HEIGHT - PADDING.bottom - ((w - yMin) / (yMax - yMin)) * chartH;

  const xs = points.map((p) => xScale(p.t));

  const linePath = points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.t)} ${yScale(p.weightLbs)}`,
    )
    .join(" ");

  const ticks: number[] = [];
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step)
    ticks.push(v);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    xs.forEach((px, i) => {
      const dist = Math.abs(px - x);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const last = points[points.length - 1];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="currentColor"
              className="text-zinc-100 dark:text-zinc-700"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-zinc-400 text-[10px]"
            >
              {v}
            </text>
          </g>
        ))}

        {hovered && (
          <line
            x1={xScale(hovered.t)}
            x2={xScale(hovered.t)}
            y1={PADDING.top}
            y2={HEIGHT - PADDING.bottom}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-600"
            strokeWidth={1}
          />
        )}

        <path
          d={linePath}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <circle
            key={p.event.id}
            cx={xScale(p.t)}
            cy={yScale(p.weightLbs)}
            r={3}
            fill={LINE_COLOR}
            stroke="white"
            className="dark:stroke-zinc-800 cursor-pointer"
            strokeWidth={2}
            onClick={() => onEditWeight(p.event)}
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}

        <text
          x={xScale(last.t)}
          y={yScale(last.weightLbs) - 10}
          textAnchor="end"
          className="fill-zinc-500 text-[8px] font-medium"
        >
          {last.weightLbs} lbs
        </text>

        <text
          x={PADDING.left}
          y={HEIGHT - 6}
          className="fill-zinc-400 text-[8px]"
        >
          {points[0].date}
        </text>
        <text
          x={WIDTH - PADDING.right}
          y={HEIGHT - 6}
          textAnchor="end"
          className="fill-zinc-400 text-[8px]"
        >
          {last.date}
        </text>
      </svg>

      {hovered && (
        <div
          className="absolute pointer-events-none bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-sm px-2 py-1 text-xs -translate-x-1/2"
          style={{ left: `${(xScale(hovered.t) / WIDTH) * 100}%`, top: 4 }}
        >
          <div className="font-semibold text-zinc-700 dark:text-zinc-100">
            {hovered.weightLbs} lbs
          </div>
          <div className="text-zinc-400">{hovered.date}</div>
        </div>
      )}
    </div>
  );
}
