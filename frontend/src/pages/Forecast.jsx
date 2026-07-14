import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cpu, TrendingUp } from "lucide-react";
import { PageHeader, Panel, Button, LoadingState, ErrorState, EmptyState } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { ForecastAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

function formatChart(data) {
  return data.map((d) => ({
    time: new Date(d.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" }),
    vehicles: d.predicted_vehicle_count,
  }));
}

export default function Forecast() {
  const { routes, loading: routesLoading } = useRoutes();
  const [routeId, setRouteId] = useState(null);
  const [range, setRange] = useState("24");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadForecast(id, r) {
    setLoading(true);
    setError(null);
    try {
      const call = r === "24" ? ForecastAPI.next24h(id) : ForecastAPI.next7d(id);
      const { data } = await call;
      setData(data);
    } catch (err) {
      setData(null);
      setError(apiErrorMessage(err, "Model not trained for this route yet."));
    } finally {
      setLoading(false);
    }
  }

  function handleRouteChange(id) {
    setRouteId(id);
    setMessage(null);
    loadForecast(id, range);
  }

  function handleRangeChange(r) {
    setRange(r);
    if (routeId) loadForecast(routeId, r);
  }

  async function handleTrain() {
    if (!routeId) return;
    setTraining(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await ForecastAPI.train(routeId);
      setMessage(`Model trained on ${data.total_records} records.`);
      await loadForecast(routeId, range);
    } catch (err) {
      setError(apiErrorMessage(err, "Training failed — at least 30 records are required."));
    } finally {
      setTraining(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Prophet-based Forecasting"
        title="Traffic Forecasting"
        description="Train a per-route Prophet model and inspect next-24-hour or next-7-day predicted vehicle volume."
      />

      <Panel className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-full md:w-72">
            {routesLoading ? (
              <LoadingState label="Loading routes…" />
            ) : (
              <RouteSelect routes={routes} value={routeId} onChange={handleRouteChange} />
            )}
          </div>

          <div className="flex gap-2">
            {["24", "168"].map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-2 rounded-md text-xs font-mono border transition-colors ${
                  range === r
                    ? "border-accent/50 text-accent bg-accent/10"
                    : "border-hairline text-muted hover:text-ink"
                }`}
              >
                {r === "24" ? "Next 24 hours" : "Next 7 days"}
              </button>
            ))}
          </div>

          <Button onClick={handleTrain} disabled={!routeId || training} variant="ghost">
            <Cpu size={14} /> {training ? "Training…" : "Train / retrain model"}
          </Button>

          {message && <span className="text-signal text-xs font-mono">{message}</span>}
        </div>
      </Panel>

      {!routeId ? (
        <Panel>
          <EmptyState message="Select a route to view forecasts" hint="Pick a route above, then train a model if one doesn't exist yet." />
        </Panel>
      ) : loading ? (
        <LoadingState label="Generating forecast…" />
      ) : error ? (
        <Panel>
          <ErrorState message={error} />
        </Panel>
      ) : (
        <Panel>
          <div className="eyebrow mb-4 flex items-center gap-2">
            <TrendingUp size={13} /> Predicted vehicle count — {range === "24" ? "next 24h" : "next 7 days"}
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={formatChart(data || [])}>
              <CartesianGrid stroke="#242838" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#5C594E" tick={{ fontSize: 11, fontFamily: "monospace" }} interval="preserveStartEnd" />
              <YAxis stroke="#5C594E" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip
                contentStyle={{ background: "#12141C", border: "1px solid #2B2E3C", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#9C9789" }}
              />
              <Line type="monotone" dataKey="vehicles" stroke="#C9A961" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}
