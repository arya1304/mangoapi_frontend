import { NavLink } from "react-router-dom";

// ── Icons ─────────────────────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#00e5ff" strokeWidth="1.4" />
      <ellipse cx="8" cy="8" rx="6" ry="2.5" stroke="#00e5ff" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1.2" fill="#00e5ff" />
    </svg>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
    const navLinks = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/about", label: "About Us" },
    ];

  const authLinks = [
    { to: "/login", label: "Login" },
    { to: "/signup", label: "Sign Up" },
  ];

  return (
    <div style={styles.wrapper}>
      <nav style={styles.pill}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <LogoIcon />
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Nav links */}
        <div style={styles.links}>
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                ...styles.link,
                color: isActive ? "#00e5ff" : "#c8d8e8",
                background: isActive ? "#00e5ff11" : "transparent"
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Auth pills */}
        <div style={styles.authGroup}>
          {authLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.authLink,
                background: isActive ? "#00e5ff22" : "#1a2535",
                color: isActive ? "#00e5ff" : "#c8d8e8",
                border: isActive ? "1px solid #00e5ff44" : "1px solid #2a3f55"
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

      </nav>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    zIndex: 200,
    pointerEvents: "none"
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#0d1117",
    border: "1px solid #1e2d3d",
    borderRadius: 999,
    padding: "6px 6px 6px 10px",
    boxShadow: "0 4px 24px #00000066",
    pointerEvents: "all"
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#111820",
    border: "1px solid #1e2d3d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  divider: {
    width: 1,
    height: 20,
    background: "#1e2d3d",
    margin: "0 8px"
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 2
  },
  link: {
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    letterSpacing: "0.04em",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: 999,
    transition: "color 0.15s, background 0.15s"
  },
  authGroup: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginLeft: 8
  },
  authLink: {
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    letterSpacing: "0.04em",
    textDecoration: "none",
    padding: "6px 16px",
    borderRadius: 999,
    transition: "color 0.15s, background 0.15s, border-color 0.15s"
  }
};