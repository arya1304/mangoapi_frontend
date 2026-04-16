import { useEffect, useState, useRef } from "react";
import "./dashboard.css"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

// ── Config ───────────────────────────────────────────────────────────────────
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

// ── Quarter helpers ───────────────────────────────────────────────────────────
function generateQuarters() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQ = Math.ceil((now.getMonth() + 1) / 3);
  const quarters = [];
  for (let y = 2015; y <= currentYear; y++) {
    const maxQ = y === currentYear ? currentQ : 4;
    for (let q = 1; q <= maxQ; q++) quarters.push(`${y}-Q${q}`);
  }
  return quarters.reverse();
}

const ALL_QUARTERS = generateQuarters();

// ── ChevronIcon ───────────────────────────────────────────────────────────────
function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        flexShrink: 0,
        transition: "transform 0.2s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)"
      }}
    >
      <path
        d="M2.5 5L7 9.5L11.5 5"
        stroke="#445566"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── QuarterDropdown ───────────────────────────────────────────────────────────
function QuarterDropdown({ value, onChange, quarters }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeYear, setActiveYear] = useState(value.split("-")[0]);
  const ref = useRef(null);
  const listRef = useRef(null);

  const years = [...new Set(quarters.map(q => q.split("-")[0]))];

  const filtered = search
    ? quarters.filter(q => q.toLowerCase().includes(search.toLowerCase()))
    : quarters.filter(q => q.startsWith(activeYear));

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll selected option into view when panel opens
  useEffect(() => {
    if (open && listRef.current) {
      const sel = listRef.current.querySelector(".qd-option-selected");
      if (sel) sel.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeYear, search]);

  function handleSelect(q) {
    onChange(q);
    setOpen(false);
    setSearch("");
    setActiveYear(q.split("-")[0]);
  }

  return (
    <div ref={ref} style={{ position: "relative", width: 140 }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 40,
          padding: "0 12px 0 14px",
          background: open ? "#141e28" : "#111820",
          border: `1px solid ${open ? "#00e5ff33" : "#1e2d3d"}`,
          borderRadius: 6,
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          gap: 8,
          userSelect: "none"
        }}
      >
        <span style={{ fontSize: 13, color: "#c8d8e8", letterSpacing: "0.04em", fontFamily: "inherit" }}>
          {value}
        </span>
        <ChevronIcon open={open} />
      </div>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: 180,
            background: "#111820",
            border: "1px solid #1e2d3d",
            borderRadius: 8,
            zIndex: 100,
            overflow: "hidden",
            boxShadow: "0 8px 32px #00000088",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Search */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #1a2535" }}>
            <input
              autoFocus
              placeholder="Search…"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveYear(null); }}
              style={{
                width: "100%",
                background: "#0d1117",
                border: "1px solid #1e2d3d",
                borderRadius: 4,
                color: "#c8d8e8",
                fontFamily: "inherit",
                fontSize: 12,
                padding: "5px 8px",
                outline: "none",
                boxSizing: "border-box",
                letterSpacing: "0.04em"
              }}
              onFocus={e => (e.target.style.borderColor = "#00e5ff44")}
              onBlur={e => (e.target.style.borderColor = "#1e2d3d")}
            />
          </div>

          {/* Year tabs */}
          {!search && (
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                padding: "6px 8px 0",
                gap: 4,
                borderBottom: "1px solid #1a2535",
                scrollbarWidth: "none"
              }}
            >
              {years.map(y => (
                <div
                  key={y}
                  onClick={() => { setActiveYear(y); setSearch(""); }}
                  style={{
                    fontSize: 11,
                    color: y === activeYear ? "#00e5ff" : "#445566",
                    cursor: "pointer",
                    padding: "3px 8px 5px",
                    borderRadius: "4px 4px 0 0",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.04em",
                    borderBottom: y === activeYear ? "2px solid #00e5ff" : "2px solid transparent",
                    transition: "color 0.12s, border-color 0.12s",
                    userSelect: "none"
                  }}
                >
                  {y}
                </div>
              ))}
            </div>
          )}

          {/* Options list */}
          <div
            ref={listRef}
            style={{
              maxHeight: 200,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#1e2d3d transparent"
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "16px 12px", fontSize: 12, color: "#334455", textAlign: "center" }}>
                No results
              </div>
            ) : (
              <div style={{ padding: "6px 0" }}>
                {!search && activeYear && (
                  <div style={{ fontSize: 10, color: "#2a3f55", letterSpacing: "0.1em", padding: "2px 12px 4px" }}>
                    {activeYear}
                  </div>
                )}
                {filtered.map(q => {
                  const isSelected = q === value;
                  return (
                    <div
                      key={q}
                      className={isSelected ? "qd-option-selected" : ""}
                      onClick={() => handleSelect(q)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        color: isSelected ? "#00e5ff" : "#8899aa",
                        letterSpacing: "0.04em",
                        background: "transparent",
                        transition: "background 0.1s, color 0.1s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#1a2535";
                        if (!isSelected) e.currentTarget.style.color = "#c8d8e8";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = isSelected ? "#00e5ff" : "#8899aa";
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#00e5ff",
                          flexShrink: 0,
                          opacity: isSelected ? 1 : 0,
                          transition: "opacity 0.1s"
                        }}
                      />
                      {q}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
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

// ── CustomTooltip ─────────────────────────────────────────────────────────────
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

// ── TrendChart ────────────────────────────────────────────────────────────────
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

// ── Dashboard ─────────────────────────────────────────────────────────────────
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
      if (!response.ok) throw new Error("API error");
      const json = await response.json();
      setResults({ cpi: json });
    } catch {
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
        <p className="subtitle">Consumer Price Index · Quarterly View</p>

        <div className="controls">
          <QuarterDropdown
            value={start}
            onChange={setStart}
            quarters={ALL_QUARTERS}
          />

          <QuarterDropdown
            value={end}
            onChange={setEnd}
            quarters={ALL_QUARTERS}
          />

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