import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/analyze",
    label: "Analyze",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    to: "/reviews",
    label: "Reviews",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
      </svg>
    ),
  },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:        #0c0c0e;
          --sidebar-bg: #111114;
          --sidebar-w:  220px;
          --sidebar-w-collapsed: 64px;
          --accent:     #c8a96e;
          --accent-dim: rgba(200,169,110,0.12);
          --muted:      #5a5750;
          --text:       #c8c4bc;
          --text-dim:   #6b6760;
          --border:     rgba(255,255,255,0.06);
          --surface:    #16161a;
          --page-bg:    #0f0f12;
        }

        .ly-root {
          display: flex;
          min-height: 100vh;
          background: var(--page-bg);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SIDEBAR ── */
        .ly-sidebar {
          width: var(--sidebar-w);
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }

        .ly-sidebar.collapsed { width: var(--sidebar-w-collapsed); }

        /* Brand */
        .ly-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px 16px 20px;
          border-bottom: 1px solid var(--border);
          min-height: 72px;
          overflow: hidden;
          white-space: nowrap;
        }

        .ly-brand-icon {
          width: 32px; height: 32px;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--ink);
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        .ly-brand-icon span { display: block; transform: rotate(-45deg); }

        .ly-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          color: #e8e4dc;
          letter-spacing: 0.02em;
          opacity: 1;
          transition: opacity 0.2s;
        }

        .collapsed .ly-brand-name { opacity: 0; pointer-events: none; }

        /* Nav */
        .ly-nav {
          flex: 1;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .ly-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 10px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--text-dim);
          font-size: 13.5px;
          font-weight: 400;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
          position: relative;
          overflow: hidden;
        }

        .ly-nav-link:hover {
          background: var(--accent-dim);
          color: var(--text);
        }

        .ly-nav-link.active {
          background: var(--accent-dim);
          color: var(--accent);
        }

        .ly-nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          background: var(--accent);
          border-radius: 0 2px 2px 0;
        }

        .ly-nav-icon {
          width: 18px; height: 18px;
          flex-shrink: 0;
        }

        .ly-nav-label {
          opacity: 1;
          transition: opacity 0.15s;
        }

        .collapsed .ly-nav-label { opacity: 0; pointer-events: none; }

        /* Section label */
        .ly-nav-section {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 12px 10px 6px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.15s;
        }

        .collapsed .ly-nav-section { opacity: 0; }

        /* Bottom: user + collapse */
        .ly-sidebar-bottom {
          border-top: 1px solid var(--border);
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ly-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 6px;
          overflow: hidden;
          white-space: nowrap;
        }

        .ly-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--accent-dim);
          border: 1px solid rgba(200,169,110,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          flex-shrink: 0;
        }

        .ly-user-info { overflow: hidden; }

        .ly-user-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
          opacity: 1;
          transition: opacity 0.15s;
        }

        .collapsed .ly-user-name { opacity: 0; }

        .ly-user-role {
          font-size: 10px;
          color: var(--muted);
          opacity: 1;
          transition: opacity 0.15s;
        }

        .collapsed .ly-user-role { opacity: 0; }

        .ly-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 10px;
          border-radius: 6px;
          background: none;
          border: none;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          cursor: pointer;
          width: 100%;
          text-align: left;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }

        .ly-logout-btn:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }

        .ly-logout-icon {
          width: 18px; height: 18px;
          flex-shrink: 0;
        }

        .ly-logout-label {
          opacity: 1;
          transition: opacity 0.15s;
        }

        .collapsed .ly-logout-label { opacity: 0; pointer-events: none; }

        /* Collapse toggle */
        .ly-collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
          border-radius: 6px;
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          margin-left: auto;
          margin-right: 8px;
          margin-bottom: 4px;
          transition: background 0.15s, color 0.15s, transform 0.25s;
          flex-shrink: 0;
        }

        .ly-collapse-btn:hover { background: var(--accent-dim); color: var(--accent); }
        .collapsed .ly-collapse-btn { transform: rotate(180deg); margin: 0 auto 4px; }

        /* ── MAIN ── */
        .ly-main {
          margin-left: var(--sidebar-w);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        .ly-main.collapsed { margin-left: var(--sidebar-w-collapsed); }

        /* Topbar */
        .ly-topbar {
          height: 56px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 32px;
          background: var(--sidebar-bg);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .ly-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #e8e4dc;
          font-weight: 400;
        }

        .ly-topbar-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ly-status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #4caf50;
          box-shadow: 0 0 6px rgba(76,175,80,0.6);
        }

        .ly-status-text {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.05em;
        }

        /* Content */
        .ly-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        /* Tooltip for collapsed state */
        .ly-nav-link[data-label]:hover::after {
          content: attr(data-label);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #1e1e24;
          color: var(--text);
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid var(--border);
          white-space: nowrap;
          pointer-events: none;
          z-index: 200;
        }

        @media (max-width: 768px) {
          .ly-sidebar { transform: translateX(-100%); }
          .ly-main { margin-left: 0 !important; }
        }
      `}</style>

      <div className="ly-root">
        {/* SIDEBAR */}
        <aside className={`ly-sidebar${collapsed ? " collapsed" : ""}`}>
          <div className="ly-brand">
            <div className="ly-brand-icon"><span>◈</span></div>
            <span className="ly-brand-name">SentimentAI</span>
          </div>

          <nav className="ly-nav">
            <div className="ly-nav-section">Menu</div>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `ly-nav-link${isActive ? " active" : ""}`
                }
                data-label={collapsed ? item.label : undefined}
              >
                <span className="ly-nav-icon">{item.icon}</span>
                <span className="ly-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ly-sidebar-bottom">
            <button
              className="ly-collapse-btn"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="ly-user">
              <div className="ly-avatar">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="ly-user-info">
                <div className="ly-user-name">{user?.name || "User"}</div>
                <div className="ly-user-role">{user?.email || ""}</div>
              </div>
            </div>

            <button className="ly-logout-btn" onClick={handleLogout}>
              <svg className="ly-logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="ly-logout-label">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className={`ly-main${collapsed ? " collapsed" : ""}`}>
          <header className="ly-topbar">
            <span className="ly-page-title">
              {NAV_ITEMS.find((n) => {
                if (n.to === "/") return location.pathname === "/";
                return location.pathname.startsWith(n.to);
              })?.label || "Dashboard"}
            </span>
            <div className="ly-topbar-right">
              <div className="ly-status-dot" />
              <span className="ly-status-text">Live</span>
            </div>
          </header>

          <main className="ly-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
