import { useEffect, useState } from "react";
import { Activity, Route as RouteIcon, Database, FlaskConical, Gauge, Car } from "lucide-react";
import { PageHeader, Panel, LoadingState, ErrorState, StatusBadge } from "../components/ui/Primitives";
import RadarConsole from "../components/charts/RadarConsole";
import { DashboardAPI, LiveAPI, CongestionAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useInterval } from "../hooks/useInterval";

const ACCENTS = {
  accent: { bg: "bg-accent/10", border: "border-accent/25", text: "text-accent" },
  signal: { bg: "bg-signal/10", border: "border-signal/25", text: "text-signal" },
  critical: { bg: "bg-critical/10", border: "border-critical/25", text: "text-critical" },
};

function StatTile({ icon: Icon, label, value, accent }) {
  const a = ACCENTS[accent] || ACCENTS.accent;
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.bg} border ${a.border}`}>
        <Icon size={16} className={a.text} />
      </div>
      <div>
        <div className="font-display text-[28px] leading-none font-semibold text-ink">{value}</div>
        <div className="eyebrow mt-2">{label}</div>
      </div>
    </Panel>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [statsRes, routesRes, alertsRes] = await Promise.all([
        DashboardAPI.get(),
        LiveAPI.routes(),
        CongestionAPI.alerts(),
      ]);
      setStats(statsRes.data);
      setRoutes(routesRes.data);
      setAlerts(alertsRes.data);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load command deck telemetry."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useInterval(load, 20000);

  if (loading) return <LoadingState label="Bringing command deck online…" />;
  if (error) return <ErrorState message={error} />;

  const radarData = routes.map((r) => ({
    route_id: r.route_id,
    route_code: r.route_code,
    congestion: r.congestion_level,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="System Overview"
        title="Executive Dashboard"
        description="Live snapshot of the network — routes tracked, congestion posture, and simulation activity across the AI Traffic & Mobility platform."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile icon={RouteIcon} label="Active routes" value={stats.total_routes} accent="accent" />
        <StatTile icon={Database} label="Traffic records" value={stats.total_records} accent="signal" />
        <StatTile icon={FlaskConical} label="Simulations run" value={stats.total_simulations} accent="accent" />
        <StatTile icon={Gauge} label="Avg. congestion" value={`${stats.average_congestion}%`} accent="critical" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Panel className="lg:col-span-2 flex flex-col items-center">
          <div className="eyebrow self-start mb-2">Network Radar Scope</div>
          <RadarConsole routes={radarData} />
          <div className="flex items-center gap-4 mt-2 text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5"><span className="led-green" /> Low</span>
            <span className="flex items-center gap-1.5"><span className="led-caution" /> Moderate</span>
            <span className="flex items-center gap-1.5"><span className="led-red" /> High</span>
          </div>
        </Panel>

        <Panel className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="eyebrow">Congestion Alerts (next 24h)</div>
            <Activity size={14} className="text-muted" />
          </div>
          {alerts.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">
              No high-congestion alerts forecast right now. Train a model on the Traffic Forecasting screen to populate this feed.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {alerts.slice(0, 8).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-void/60 border border-hairline rounded-lg px-4 py-3 hover:border-accent/25 transition-colors"
                >
                  <div>
                    <div className="text-sm text-ink flex items-center gap-2">
                      <Car size={13} className="text-muted" />
                      {a.message}
                    </div>
                    <div className="font-mono text-[11px] text-faint mt-1">
                      {a.route_code} · {new Date(a.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <StatusBadge level={a.severity} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <p className="text-faint text-xs font-mono mt-6">
        Last record: {stats.latest_record ? new Date(stats.latest_record).toLocaleString() : "—"} · Last simulation:{" "}
        {stats.last_simulation ? new Date(stats.last_simulation).toLocaleString() : "—"}
      </p>
    </div>
  );
}
