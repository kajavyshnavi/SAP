import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api";

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["", "#e55", "#e8843a", "#c8a96e", "#6abf8a", "#4caf50"];

  if (!password) return null;

  return (
    <div className="l-strength">
      <div className="l-strength-bars">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="l-strength-bar"
            style={{ background: i <= strength ? colors[strength] : "var(--border)" }}
          />
        ))}
      </div>
      <span className="l-strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await signup(form.name, form.email, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.confirm && form.password === form.confirm;
  const passwordsMismatch = form.confirm && form.password !== form.confirm;

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
          --success: #4caf50;
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

        .l-features {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .l-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .l-feature-icon {
          width: 32px; height: 32px;
          border: 1px solid rgba(200,169,110,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .l-feature-text strong {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--paper);
          margin-bottom: 2px;
        }

        .l-feature-text span {
          font-size: 12px;
          color: var(--muted);
          font-weight: 300;
        }

        .l-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 56px;
          background: var(--paper);
          position: relative;
          overflow-y: auto;
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
          padding: 8px 0;
          animation: l-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes l-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .l-title-block { margin-bottom: 32px; }

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

        .l-form { display: flex; flex-direction: column; gap: 18px; }

        .l-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .l-field { display: flex; flex-direction: column; gap: 7px; }

        .l-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .l-input-wrap { position: relative; }

        .l-input {
          width: 100%;
          padding: 13px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
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

        .l-input.is-valid {
          border-color: var(--success);
          padding-right: 40px;
        }

        .l-input.is-invalid {
          border-color: var(--error);
          box-shadow: 0 0 0 3px rgba(192,57,43,0.08);
          padding-right: 40px;
        }

        .l-input-icon {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          pointer-events: none;
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

        .l-strength {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }

        .l-strength-bars { display: flex; gap: 4px; flex: 1; }

        .l-strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          transition: background 0.3s;
        }

        .l-strength-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          min-width: 52px;
          text-align: right;
          transition: color 0.3s;
        }

        .l-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 3px solid var(--error);
          padding: 11px 14px;
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
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1em;
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

        .l-terms {
          font-size: 11px;
          color: var(--muted);
          text-align: center;
          line-height: 1.7;
        }

        .l-terms a {
          color: var(--ink);
          text-decoration: none;
          border-bottom: 1px solid var(--border);
        }

        .l-footer {
          margin-top: 24px;
          padding-top: 20px;
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

        .l-left > * { animation: l-fadein 0.6s ease both; }
        .l-left > *:nth-child(2) { animation-delay: 0.1s; }
        .l-left > *:nth-child(3) { animation-delay: 0.2s; }

        @keyframes l-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .l-root { grid-template-columns: 1fr; }
          .l-left { display: none; }
          .l-right { padding: 40px 24px; align-items: flex-start; padding-top: 60px; }
          .l-row { grid-template-columns: 1fr; }
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
            <div className="l-eyebrow">Get Started</div>
            <h2 className="l-headline">
              Your data.<br />
              Your <em>edge</em>.
            </h2>
            <p className="l-desc">
              Join thousands of teams turning customer feedback into
              competitive intelligence — in seconds.
            </p>
          </div>
          <div className="l-features">
            {[
              { icon: "⚡", title: "Instant Analysis", desc: "Results in under 12ms" },
              { icon: "◎", title: "99.9% Uptime",     desc: "Enterprise-grade reliability" },
              { icon: "⬡", title: "API-First",        desc: "Integrate with any stack" },
            ].map((f) => (
              <div className="l-feature" key={f.title}>
                <div className="l-feature-icon">{f.icon}</div>
                <div className="l-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="l-right">
          <div className="l-card">
            <div className="l-title-block">
              <div className="l-title-tag">
                <div className="l-title-tag-dot" />
                Free Forever Plan
              </div>
              <h1 className="l-title">Create account</h1>
              <p className="l-subtitle">Start analysing reviews today</p>
            </div>

            {error && (
              <div className="l-error" style={{ marginBottom: 18 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="l-form">
              <div className="l-row">
                <div className="l-field">
                  <label className="l-label">Full Name</label>
                  <div className="l-input-wrap">
                    <input
                      className="l-input"
                      type="text"
                      name="name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                    <div className="l-input-bar" />
                  </div>
                </div>

                <div className="l-field">
                  <label className="l-label">Email</label>
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
              </div>

              <div className="l-field">
                <label className="l-label">Password</label>
                <div className="l-input-wrap">
                  <input
                    className="l-input"
                    type="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <div className="l-input-bar" />
                </div>
                <PasswordStrength password={form.password} />
              </div>

              <div className="l-field">
                <label className="l-label">Confirm Password</label>
                <div className="l-input-wrap">
                  <input
                    className={`l-input ${passwordsMatch ? "is-valid" : ""} ${passwordsMismatch ? "is-invalid" : ""}`}
                    type="password"
                    name="confirm"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {passwordsMatch   && <span className="l-input-icon" style={{ color: "var(--success)" }}>✓</span>}
                  {passwordsMismatch && <span className="l-input-icon" style={{ color: "var(--error)" }}>✕</span>}
                  <div className="l-input-bar" />
                </div>
              </div>

              <button type="submit" className="l-btn" disabled={loading}>
                {loading ? <span className="l-spinner" /> : "Create Account"}
              </button>

              <p className="l-terms">
                By creating an account you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </p>
            </form>

            <div className="l-footer">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}