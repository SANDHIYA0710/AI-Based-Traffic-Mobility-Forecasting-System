import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radar, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui/Primitives";
import { apiErrorMessage } from "../api/client";

const HIGHLIGHTS = [
  { icon: TrendingUp, text: "Prophet-based forecasting across every tracked route" },
  { icon: ShieldCheck, text: "Real-time anomaly detection and congestion intelligence" },
  { icon: Sparkles, text: "AI-generated insights and mobility recommendations" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid credentials."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* Hero panel */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden border-r border-hairline">
        <div
          className="absolute inset-0 console-grid opacity-60"
          style={{
            background:
              "radial-gradient(circle at 20% 15%, rgba(201,169,97,0.10), transparent 50%), radial-gradient(circle at 80% 85%, rgba(201,169,97,0.06), transparent 50%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-full border border-accent/40 flex items-center justify-center">
              <Radar size={16} className="text-accent" />
            </div>
            <div className="font-display font-semibold text-lg text-ink tracking-wide">
              TrafficFlow AI
            </div>
          </div>

          <div className="gold-rule w-14 mb-6" />
          <h1 className="font-display text-4xl leading-[1.15] font-semibold text-ink max-w-md">
            Mobility intelligence,<br /> refined for the network you run.
          </h1>
          <p className="text-muted text-sm mt-5 max-w-sm leading-relaxed">
            A single suite for forecasting, anomaly detection, and congestion
            intelligence — built to keep your traffic network a step ahead.
          </p>
        </div>

        <div className="relative space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-accent/25 bg-accent/[0.06] flex items-center justify-center shrink-0">
                <Icon size={14} className="text-accent" />
              </div>
              <span className="text-sm text-muted">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-full border border-accent/40 flex items-center justify-center">
              <Radar size={18} className="text-accent" />
            </div>
            <div>
              <div className="font-display font-semibold text-xl text-ink tracking-wide">
                TrafficFlow AI
              </div>
              <div className="font-mono text-[10px] text-faint tracking-widest">
                MOBILITY INTELLIGENCE SUITE
              </div>
            </div>
          </div>

          <div className="mb-7">
            <div className="eyebrow mb-2">Authentication</div>
            <h2 className="font-display text-2xl font-semibold text-ink">Welcome back</h2>
            <p className="text-muted text-sm mt-1.5">Sign in to access your mobility dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="text-critical text-xs font-mono border border-critical/30 bg-critical/5 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            No access credentials?{" "}
            <Link to="/register" className="text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
