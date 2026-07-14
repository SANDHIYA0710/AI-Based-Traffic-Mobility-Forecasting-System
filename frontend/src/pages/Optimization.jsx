import { useEffect, useState } from "react";
import { Compass, Clock, Scale } from "lucide-react";
import { PageHeader, Panel, Button, LoadingState, ErrorState, EmptyState } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { OptimizationAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

const TABS = [
  { id: "alternatives", label: "Alternative Routes", icon: Compass },
  { id: "timing", label: "Best Travel Time", icon: Clock },
  { id: "balancing", label: "Load Balancing", icon: Scale },
];

function AlternativesPanel({ routes, routesLoading }) {
  const [routeId, setRouteId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const { data } = await OptimizationAPI.alternativeRoutes(id);
      setData(data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <div className="w-full md:w-72 mb-5">
        {routesLoading ? <LoadingState label="Loading routes…" /> : <RouteSelect routes={routes} value={routeId} onChange={handleChange} />}
      </div>
      {!routeId ? (
        <EmptyState message="Select a route to find alternatives" />
      ) : loading ? (
        <LoadingState label="Comparing network routes…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div>
          <div className="text-sm text-muted mb-4">
            <span className="text-ink">{data.route}</span> is currently averaging{" "}
            <span className="font-mono text-accent">{data.current_average_congestion}%</span> congestion.
          </div>
          {data.alternatives?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.alternatives.map((a) => (
                <div key={a.route_id} className="bg-void border border-hairline rounded-md p-4">
                  <div className="text-ink text-sm">{a.route}</div>
                  <div className="font-mono text-[11px] text-faint mt-0.5">{a.route_code} · {a.distance_km} km</div>
                  <div className="font-mono text-lg text-signal mt-2">{a.average_congestion}%</div>
                  <div className="text-xs text-signal mt-1">
                    ~{a.estimated_time_saved_percentage}% less congested
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message={data.message || "No better alternative found"} />
          )}
        </div>
      )}
    </Panel>
  );
}

function TimingPanel({ routes, routesLoading }) {
  const [routeId, setRouteId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const { data } = await OptimizationAPI.bestTravelTime(id);
      setData(data);
    } catch (err) {
      setError(apiErrorMessage(err, "Train a forecasting model for this route first."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <div className="w-full md:w-72 mb-5">
        {routesLoading ? <LoadingState label="Loading routes…" /> : <RouteSelect routes={routes} value={routeId} onChange={handleChange} />}
      </div>
      {!routeId ? (
        <EmptyState message="Select a route to find its best travel window" />
      ) : loading ? (
        <LoadingState label="Scanning the next 24 hours…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-signal/5 border border-signal/25 rounded-md p-4">
            <div className="eyebrow text-signal mb-2">Best window</div>
            <div className="font-display text-xl text-ink">
              {new Date(data.best_travel_time).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="font-mono text-sm text-signal mt-1">
              {data.predicted_congestion_at_best_time}% congestion
            </div>
          </div>
          <div className="bg-critical/5 border border-critical/25 rounded-md p-4">
            <div className="eyebrow text-critical mb-2">Worst window</div>
            <div className="font-display text-xl text-ink">
              {new Date(data.worst_travel_time).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="font-mono text-sm text-critical mt-1">
              {data.predicted_congestion_at_worst_time}% congestion
            </div>
          </div>
          <div className="md:col-span-2 text-sm text-accent bg-accent/5 border border-accent/25 rounded-md p-4">
            {data.recommendation}
          </div>
        </div>
      )}
    </Panel>
  );
}

function BalancingPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    OptimizationAPI.loadBalancing()
      .then(({ data }) => setData(data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Panel><LoadingState label="Assessing network load…" /></Panel>;
  if (error) return <Panel><ErrorState message={error} /></Panel>;
  if (data.message) return <Panel><EmptyState message={data.message} /></Panel>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel>
          <div className="eyebrow text-critical mb-2">Overloaded routes</div>
          {data.overloaded_routes.length === 0 ? (
            <p className="text-muted text-sm">None</p>
          ) : (
            data.overloaded_routes.map((r) => (
              <div key={r.route_id} className="text-sm py-1.5 flex justify-between">
                <span className="text-ink">{r.route_code}</span>
                <span className="font-mono text-critical">{r.average_congestion}%</span>
              </div>
            ))
          )}
        </Panel>
        <Panel>
          <div className="eyebrow text-accent mb-2">Balanced routes</div>
          {data.balanced_routes.length === 0 ? (
            <p className="text-muted text-sm">None</p>
          ) : (
            data.balanced_routes.map((r) => (
              <div key={r.route_id} className="text-sm py-1.5 flex justify-between">
                <span className="text-ink">{r.route_code}</span>
                <span className="font-mono text-accent">{r.average_congestion}%</span>
              </div>
            ))
          )}
        </Panel>
        <Panel>
          <div className="eyebrow text-signal mb-2">Underutilized routes</div>
          {data.underutilized_routes.length === 0 ? (
            <p className="text-muted text-sm">None</p>
          ) : (
            data.underutilized_routes.map((r) => (
              <div key={r.route_id} className="text-sm py-1.5 flex justify-between">
                <span className="text-ink">{r.route_code}</span>
                <span className="font-mono text-signal">{r.average_congestion}%</span>
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel>
        <div className="eyebrow mb-3">Load balancing suggestions</div>
        {data.load_balancing_suggestions.length === 0 ? (
          <EmptyState message="No redistribution needed right now" />
        ) : (
          <div className="space-y-2">
            {data.load_balancing_suggestions.map((s, i) => (
              <div key={i} className="bg-void border border-hairline rounded-md px-4 py-3 text-sm text-ink">
                {s.message}
                <span className="font-mono text-xs text-muted ml-2">
                  ({s.from_average_congestion}% → {s.suggested_average_congestion}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default function Optimization() {
  const { routes, loading: routesLoading } = useRoutes();
  const [tab, setTab] = useState("alternatives");

  return (
    <div>
      <PageHeader
        eyebrow="Optimization Engine"
        title="Mobility Optimization"
        description="Alternative-route suggestions, best travel windows, and network-wide load balancing recommendations."
      />

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm border transition-colors ${
              tab === t.id ? "border-accent/50 text-accent bg-accent/10" : "border-hairline text-muted hover:text-ink"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "alternatives" && <AlternativesPanel routes={routes} routesLoading={routesLoading} />}
      {tab === "timing" && <TimingPanel routes={routes} routesLoading={routesLoading} />}
      {tab === "balancing" && <BalancingPanel />}
    </div>
  );
}
