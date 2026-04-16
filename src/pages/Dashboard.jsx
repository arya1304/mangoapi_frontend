import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

// ── Config ──────────────────────────────────────────────────────────────────
const BASE = "/api/prod/public";

const INDICATORS = {
  cpi: {
    label: "CPI",
    valueKey: "cpi_value",
    unit: "IDX",
    color: "#00e5ff",
    endpoint: `${BASE}/cpi`
  }
};

// Generate quarter options
function generateQuarters() {
  const quarters = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQ = Math.ceil((now.getMonth() + 1) / 3);

  for (let y = 2015; y <= currentYear; y++) {
    const maxQ = y === currentYear ? currentQ : 4;
    for (let q = 1; q <= maxQ; q++) {
      quarters.push(`${y}-Q${q}`);
    }
  }

  return quarters.reverse();
}

const ALL_QUARTERS = generateQuarters();

// ── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, color, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>

      {loading ? (
        <div className="stat-skeleton" />
      ) : (
        <div className="stat-value" style={{ color }}>
          {value !== null ? value.toFixed(1) : "—"}
          <span className="stat-unit">{unit}</span>
        </div>
      )}

      <div className="stat-accent" style={{ background: color }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tt-period">{label}</p>
        <p className="tt-value" style={{ color: payload[0].stroke }}>
          {payload[0].value?.toFixed(2)} {payload[0].payload.unit_measure}
        </p>
      </div>
    );
  }
  return null;
};

function TrendChart({ label, chartData, valueKey, color, loading }) {
  return (
    <div className="chart-box">
      <div className="chart-header">
        <span className="chart-dot" style={{ background: color }} />
        <span className="chart-title">{label} Trend</span>
      </div>

      {loading ? (
        <div className="chart-skeleton" />
      ) : chartData.length === 0 ? (
        <div className="chart-empty">No data for selected range</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

            <XAxis
              dataKey="time_period"
              tick={{ fill: "#8899aa", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#8899aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color, stroke: "#0d1117", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {

  const [start, setStart] = useState("2023-Q1");
  const [end, setEnd] = useState("2024-Q4");

  const [results, setResults] = useState({ cpi: null });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${INDICATORS.cpi.endpoint}?start=${start}&end=${end}`
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const json = await response.json();

      setResults({ cpi: json });

    } catch (e) {
      setError("Failed to fetch data. Check your API.");
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function getLatest() {
    const events = results.cpi?.events;
    if (!events || events.length === 0) return null;

    return events[events.length - 1].cpi_value;
  }

  function getHistory() {
    return results.cpi?.events ?? [];
  }

  const isStartAfterEnd =
    ALL_QUARTERS.indexOf(start) < ALL_QUARTERS.indexOf(end);

  return (
    <div className="dashboard">

      {/* Header */}

      <div className="header">

        <h1>Economic Dashboard</h1>

        <p className="subtitle">
          Consumer Price Index · Quarterly View
        </p>

        <div className="controls">

          <select value={start} onChange={e => setStart(e.target.value)}>
            {ALL_QUARTERS.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          <select value={end} onChange={e => setEnd(e.target.value)}>
            {ALL_QUARTERS.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          <button
            onClick={fetchData}
            disabled={loading || isStartAfterEnd}
          >
            {loading ? "Loading..." : "Apply"}
          </button>

        </div>

        {isStartAfterEnd && (
          <p className="range-warning">Start must be before End</p>
        )}

      </div>

      {error && (
        <div className="error-msg">⚠ {error}</div>
      )}

      {/* CPI Card */}

      <div className="cards-row">

        <StatCard
          label={`CPI (${end})`}
          value={getLatest()}
          unit="IDX"
          color="#00e5ff"
          loading={loading}
        />

      </div>

      {/* Chart */}

      <TrendChart
        label="CPI"
        chartData={getHistory()}
        valueKey="cpi_value"
        color="#00e5ff"
        loading={loading}
      />

      {/* Footer */}

      <div className="source-bar">

        <div>
          Source:
          <span>
            {results.cpi?.data_source ?? "Australian Bureau of Statistics"}
          </span>
        </div>

        <div>
          Range:
          <span>
            {start} → {end}
          </span>
        </div>

      </div>

    </div>
  );
}