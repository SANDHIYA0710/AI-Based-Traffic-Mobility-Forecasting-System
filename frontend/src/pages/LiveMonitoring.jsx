import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader, Panel, LoadingState, ErrorState, StatusBadge } from "../components/ui/Primitives";
import { LiveAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useInterval } from "../hooks/useInterval";

function statusFor(level) {
  if (level >= 70) return "Heavy";
  if (level >= 40) return "Moderate";
  return "Low";
}

export default function LiveMonitoring() {
  const [overview, setOverview] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [critical, setCritical] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [o, r, c] = await Promise.all([
        LiveAPI.overview(),
        LiveAPI.routes(),
        LiveAPI.criticalRoutes(),
      ]);
      setOverview(o.data);
      setRoutes(r.data);
      setCritical(c.data);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err, "Live feed unavailable."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useInterval(load, 15000);

  if (loading) return <LoadingState label="Connecting to live feed…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        eyebrow="Real-time"
        title="Real-Time Monitoring"
        description="Rolling snapshot of the most recent traffic record per route, refreshed every 15 seconds."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Panel>
          <div className="eyebrow">Active routes</div>
          <div className="font-display text-2xl font-semibold mt-1">{overview.active_routes}</div>
        </Panel>
        <Panel>
          <div className="eyebrow text-critical">Heavy traffic</div>
          <div className="font-display text-2xl font-semibold mt-1 text-critical">
            {overview.heavy_traffic_routes}
          </div>
        </Panel>
        <Panel>
          <div className="eyebrow text-caution">Moderate traffic</div>
          <div className="font-display text-2xl font-semibold mt-1 text-caution">
            {overview.moderate_traffic_routes}
          </div>
        </Panel>
        <Panel>
          <div className="eyebrow text-signal">Low traffic</div>
          <div className="font-display text-2xl font-semibold mt-1 text-signal">
            {overview.low_traffic_routes}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <div className="eyebrow mb-3">Route status board</div>
          {routes.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">No traffic records ingested yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted font-mono text-xs uppercase tracking-wide border-b border-hairline">
                    <th className="py-2 pr-3">Route</th>
                    <th className="py-2 pr-3">Vehicles</th>
                    <th className="py-2 pr-3">Speed (km/h)</th>
                    <th className="py-2 pr-3">Congestion</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r) => (
                    <tr key={r.route_id} className="border-b border-hairline/60 last:border-0">
                      <td className="py-2.5 pr-3">
                        <div className="text-ink">{r.route}</div>
                        <div className="font-mono text-[11px] text-faint">{r.route_code}</div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono">{r.vehicle_count}</td>
                      <td className="py-2.5 pr-3 font-mono">{Math.round(r.average_speed)}</td>
                      <td className="py-2.5 pr-3 font-mono">{Math.round(r.congestion_level)}%</td>
                      <td className="py-2.5 pr-3">
                        <StatusBadge level={r.traffic_status || statusFor(r.congestion_level)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="eyebrow mb-3 flex items-center gap-2 text-critical">
            <AlertTriangle size={13} /> Critical routes
          </div>
          {critical.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">No routes above the critical threshold.</p>
          ) : (
            <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
              {critical.map((r) => (
                <div key={r.route_id} className="bg-critical/5 border border-critical/25 rounded-md px-3 py-2.5">
                  <div className="text-sm text-ink">{r.route}</div>
                  <div className="font-mono text-[11px] text-faint mt-0.5">
                    {r.route_code} · {Math.round(r.congestion_level)}% congestion
                  </div>
                  <div className="text-xs text-critical mt-1.5">{r.recommendation}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
