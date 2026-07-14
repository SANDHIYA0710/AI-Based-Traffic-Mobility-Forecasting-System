import { useEffect, useState } from "react";
import { PageHeader, Panel, LoadingState, ErrorState, EmptyState, StatusBadge } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { CongestionAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

export default function Congestion() {
  const { routes, loading: routesLoading } = useRoutes();
  const [routeId, setRouteId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsError, setAlertsError] = useState(null);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [detail, setDetail] = useState(null);
  const [peak, setPeak] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    CongestionAPI.alerts()
      .then(({ data }) => setAlerts(data))
      .catch((err) => setAlertsError(apiErrorMessage(err)))
      .finally(() => setAlertsLoading(false));
  }, []);

  async function handleRouteChange(id) {
    setRouteId(id);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const [predictRes, peakRes] = await Promise.all([
        CongestionAPI.predict(id),
        CongestionAPI.peakHours(id),
      ]);
      setDetail(predictRes.data);
      setPeak(peakRes.data);
    } catch (err) {
      setDetail(null);
      setPeak(null);
      setDetailError(apiErrorMessage(err, "Train a forecasting model for this route first."));
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Risk Monitoring"
        title="Congestion Intelligence"
        description="Network-wide high-congestion alerts, plus per-route risk breakdown and predicted peak windows."
      />

      <Panel className="mb-6">
        <div className="eyebrow mb-3">Active network alerts</div>
        {alertsLoading ? (
          <LoadingState label="Scanning routes…" />
        ) : alertsError ? (
          <ErrorState message={alertsError} />
        ) : alerts.length === 0 ? (
          <EmptyState message="No high-congestion alerts" hint="Alerts appear once trained forecasts predict 600+ vehicles on a route." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((a, i) => (
              <div key={i} className="bg-void border border-hairline rounded-md px-4 py-3 flex items-start justify-between">
                <div>
                  <div className="text-sm text-ink">{a.message}</div>
                  <div className="font-mono text-[11px] text-faint mt-1">
                    {a.route_code} · {new Date(a.timestamp).toLocaleString()} · {a.predicted_vehicle_count} vehicles
                  </div>
                </div>
                <StatusBadge level={a.severity} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="eyebrow mb-3">Per-route risk detail</div>
        <div className="w-full md:w-72 mb-5">
          {routesLoading ? (
            <LoadingState label="Loading routes…" />
          ) : (
            <RouteSelect routes={routes} value={routeId} onChange={handleRouteChange} />
          )}
        </div>

        {!routeId ? (
          <EmptyState message="Select a route to inspect" />
        ) : detailLoading ? (
          <LoadingState label="Analyzing route…" />
        ) : detailError ? (
          <ErrorState message={detailError} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-void border border-hairline rounded-md p-4">
              <div className="eyebrow mb-2">Current risk</div>
              <div className="flex items-center justify-between mb-3">
                <StatusBadge level={detail.status?.replace(" Congestion", "")} />
                <span className="font-mono text-xs text-muted">Risk: {detail.risk}</span>
              </div>
              <dl className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-muted">Predicted vehicles</dt>
                  <dd className="font-mono">{detail.predicted_vehicle_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Average speed</dt>
                  <dd className="font-mono">{detail.average_speed} km/h</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Congestion level</dt>
                  <dd className="font-mono">{detail.congestion_level}%</dd>
                </div>
              </dl>
            </div>

            <div className="bg-void border border-hairline rounded-md p-4">
              <div className="eyebrow mb-2">Top 5 predicted peak hours (next 24h)</div>
              {peak?.length ? (
                <div className="space-y-1.5">
                  {peak.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted font-mono text-xs">
                        {new Date(p.timestamp).toLocaleString([], { weekday: "short", hour: "2-digit" })}
                      </span>
                      <span className="font-mono">{Math.round(p.predicted_vehicle_count)} vehicles</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No peak data available.</p>
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
