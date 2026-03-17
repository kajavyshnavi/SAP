import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0c0c0e;
          --paper: #f5f2ed;
          --cream: #ede9e0;
          --accent: #c8a96e;
          --accent-dark: #a8893e;
          --muted: #8a8275;
          --border: #d8d3c8;
          --error: #c0392b;
          --surface: #ffffff;
        }

        .l-root {
          min-height: 100vh;
          background: var(--paper);
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        .l-left {
          background: var(--ink);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          overflow: hidden;
        }

        .l-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(200,169,110,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(200,169,110,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .l-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(200,169,110,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,169,110,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .l-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .l-brand-icon {
          width: 36px; height: 36px;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--ink);
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        .l-brand-icon span { display: block; transform: rotate(-45deg); }

        .l-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: var(--paper);
          letter-spacing: 0.02em;
        }

        .l-hero { position: relative; }

        .l-eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .l-eyebrow::before {
          content: '';
          display: block;
          width: 24px; height: 1px;
          background: var(--accent);
        }

        .l-headline {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 400;
          color: var(--paper);
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .l-headline em { font-style: italic; color: var(--accent); }

        .l-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.8;
          max-width: 340px;
          font-weight: 300;
        }

        .l-stats {
          position: relative;
          display: flex;
          gap: 40px;
        }

        .l-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: var(--paper);
          display: block;
        }

        .l-stat-label {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .l-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 52px 56px;
          background: var(--paper);
          position: relative;
        }

        .l-right::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 60%; height: 60%;
          background: radial-gradient(ellipse at top right, rgba(200,169,110,0.08), transparent 60%);
          pointer-events: none;
        }

        .l-card {
          width: 100%;
          max-width: 400px;
          position: relative;
          animation: l-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes l-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .l-title-block { margin-bottom: 40px; }

        .l-title-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--cream);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .l-title-tag-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }

        .l-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 400;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .l-subtitle {
          font-size: 14px;
          color: var(--muted);
          font-weight: 300;
        }

        .l-form { display: flex; flex-direction: column; gap: 20px; }

        .l-field { display: flex; flex-direction: column; gap: 8px; }

        .l-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .l-input-wrap { position: relative; }

        .l-input {
          width: 100%;
          padding: 14px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }

        .l-input::placeholder { color: #bbb; }

        .l-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(200,169,110,0.12);
        }

        .l-input-bar {
          position: absolute;
          bottom: -1px; left: 0;
          height: 2px;
          background: var(--accent);
          width: 0;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          border-radius: 0 0 2px 2px;
        }

        .l-input:focus ~ .l-input-bar { width: 100%; }

        .l-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 3px solid var(--error);
          padding: 12px 14px;
          border-radius: 2px;
          font-size: 13px;
          color: var(--error);
        }

        .l-btn {
          position: relative;
          width: 100%;
          padding: 15px;
          background: var(--ink);
          color: var(--paper);
          border: none;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          overflow: hidden;
          margin-top: 4px;
        }

        .l-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(200,169,110,0.15));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .l-btn:hover:not(:disabled)::after { opacity: 1; }
        .l-btn:hover:not(:disabled) { background: #1a1a1f; }
        .l-btn:active:not(:disabled) { transform: translateY(1px); }
        .l-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .l-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(245,242,237,0.3);
          border-top-color: var(--paper);
          border-radius: 50%;
          animation: l-spin 0.7s linear infinite;
        }

        @keyframes l-spin { to { transform: rotate(360deg); } }

        .l-forgot { text-align: right; margin-top: -8px; }

        .l-forgot a {
          font-size: 12px;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .l-forgot a:hover { color: var(--accent-dark); }

        .l-footer {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 13px;
          color: var(--muted);
        }

        .l-footer a {
          color: var(--ink);
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid var(--accent);
          padding-bottom: 1px;
          transition: color 0.2s;
        }

        .l-footer a:hover { color: var(--accent-dark); }

        .l-left > * { animation: l-fadein 0.7s ease both; }
        .l-left > *:nth-child(2) { animation-delay: 0.1s; }
        .l-left > *:nth-child(3) { animation-delay: 0.2s; }

        @keyframes l-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .l-root { grid-template-columns: 1fr; }
          .l-left { display: none; }
          .l-right { padding: 40px 28px; align-items: flex-start; padding-top: 80px; }
        }
      `}</style>

      <div className="l-root">
        <div className="l-left">
          <div className="l-grid-lines" />
          <div className="l-brand">
            <div className="l-brand-icon"><span>◈</span></div>
            <span className="l-brand-name">SentimentAI</span>
          </div>
          <div className="l-hero">
            <div className="l-eyebrow">Intelligence Platform</div>
            <h2 className="l-headline">
              Understand what<br />
              the world <em>feels</em>
            </h2>
            <p className="l-desc">
              Real-time sentiment analysis across millions of data points.
              Turn raw text into strategic insight with precision.
            </p>
          </div>
          <div className="l-stats">
            <div>
              <span className="l-stat-val">98.4%</span>
              <span className="l-stat-label">Accuracy</span>
            </div>
            <div>
              <span className="l-stat-val">2.1B</span>
              <span className="l-stat-label">Data points</span>
            </div>
            <div>
              <span className="l-stat-val">12ms</span>
              <span className="l-stat-label">Latency</span>
            </div>
          </div>
        </div>

        <div className="l-right">
          <div className="l-card">
            <div className="l-title-block">
              <div className="l-title-tag">
                <div className="l-title-tag-dot" />
                Secure Sign-In
              </div>
              <h1 className="l-title">Welcome back</h1>
              <p className="l-subtitle">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <div className="l-error" style={{ marginBottom: 20 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="l-form">
              <div className="l-field">
                <label className="l-label">Email Address</label>
                <div className="l-input-wrap">
                  <input
                    className="l-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  <div className="l-input-bar" />
                </div>
              </div>

              <div className="l-field">
                <label className="l-label">Password</label>
                <div className="l-input-wrap">
                  <input
                    className="l-input"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <div className="l-input-bar" />
                </div>
              </div>

              <div className="l-forgot">
                <Link to="/forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="l-btn" disabled={loading}>
                {loading ? <span className="l-spinner" /> : "Sign In"}
              </button>
            </form>

            <div className="l-footer">
              Don't have an account?{" "}
              <Link to="/signup">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}