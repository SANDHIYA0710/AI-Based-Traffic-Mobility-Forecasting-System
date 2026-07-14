import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Activity, Clock, CloudRain, GitCompare, Target } from "lucide-react";
import { PageHeader, Panel, LoadingState, ErrorState, EmptyState } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { AnalyticsAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

const chartTheme = {
  grid: "#242838",
  axis: "#5C594E",
  tooltip: { background: "#12141C", border: "1px solid #2B2E3C", borderRadius: 8, fontSize: 12 },
};

function useRouteScopedData(fetcher, deps = []) {
  const [routeId, setRouteId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(id);
      setData(result);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return { routeId, data, loading, error, handleChange };
}

function TrendsTab({ routes, routesLoading }) {
  const [routeId, setRouteId] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const [h, d, t] = await Promise.all([
        AnalyticsAPI.hourly(id),
        AnalyticsAPI.daily(id),
        AnalyticsAPI.congestionTrend(id),
      ]);
      setHourly(h.data);
      setDaily(d.data);
      setTrend(t.data);
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
        <EmptyState message="Select a route to view traffic trends" />
      ) : loading ? (
        <LoadingState label="Aggregating traffic history…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="space-y-8">
          <div>
            <div className="eyebrow mb-3">Average vehicle count by hour of day</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourly}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <YAxis stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Bar dataKey="average_vehicle_count" fill="#C9A961" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="eyebrow mb-3">Daily average speed & congestion</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={daily}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={chartTheme.axis} tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="average_speed" name="Speed (km/h)" stroke="#3FA772" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="average_congestion" name="Congestion (%)" stroke="#C7554A" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="eyebrow mb-3">Congestion trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={chartTheme.axis} tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Line type="monotone" dataKey="average_congestion" stroke="#C9A961" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Panel>
  );
}

function PeakHoursTab({ routes, routesLoading }) {
  const { routeId, data, loading, error, handleChange } = useRouteScopedData((id) =>
    AnalyticsAPI.peakHours(id).then((r) => r.data)
  );

  return (
    <Panel>
      <div className="w-full md:w-72 mb-5">
        {routesLoading ? <LoadingState label="Loading routes…" /> : <RouteSelect routes={routes} value={routeId} onChange={handleChange} />}
      </div>
      {!routeId ? (
        <EmptyState message="Select a route to view peak hours" />
      ) : loading ? (
        <LoadingState label="Ranking hourly demand…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
            <XAxis dataKey="hour" stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
            <YAxis stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Bar dataKey="average_vehicle_count" fill="#C9A961" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function WeatherTab({ routes, routesLoading }) {
  const { routeId, data, loading, error, handleChange } = useRouteScopedData((id) =>
    AnalyticsAPI.weatherImpact(id).then((r) => r.data)
  );

  return (
    <Panel>
      <div className="w-full md:w-72 mb-5">
        {routesLoading ? <LoadingState label="Loading routes…" /> : <RouteSelect routes={routes} value={routeId} onChange={handleChange} />}
      </div>
      {!routeId ? (
        <EmptyState message="Select a route to view weather impact" />
      ) : loading ? (
        <LoadingState label="Cross-referencing weather logs…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : data.length === 0 ? (
        <EmptyState message="No weather data recorded for this route" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
            <XAxis dataKey="weather" stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
            <YAxis stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="average_congestion" name="Congestion (%)" fill="#C7554A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="average_speed" name="Speed (km/h)" fill="#3FA772" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function ComparisonTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AnalyticsAPI.routeComparison()
      .then(({ data }) => setData(data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel>
      {loading ? (
        <LoadingState label="Ranking routes by congestion…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : data.length === 0 ? (
        <EmptyState message="No routes with traffic data yet" />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(320, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
            <XAxis type="number" stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
            <YAxis type="category" dataKey="route_code" stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} width={70} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Bar dataKey="average_congestion" fill="#C9A961" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function AccuracyTab({ routes, routesLoading }) {
  const [routeId, setRouteId] = useState(null);
  const [fva, setFva] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const [fvaRes, accRes] = await Promise.all([
        AnalyticsAPI.forecastVsActual(id),
        AnalyticsAPI.modelAccuracy(id),
      ]);
      setFva(fvaRes.data);
      setAccuracy(accRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Train a model for this route first."));
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
        <EmptyState message="Select a route to evaluate forecast accuracy" />
      ) : loading ? (
        <LoadingState label="Scoring model accuracy…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : accuracy?.message ? (
        <EmptyState message={accuracy.message} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-void border border-hairline rounded-md p-3 text-center">
              <div className="eyebrow">MAE</div>
              <div className="font-mono text-lg mt-1">{accuracy.mae}</div>
            </div>
            <div className="bg-void border border-hairline rounded-md p-3 text-center">
              <div className="eyebrow">RMSE</div>
              <div className="font-mono text-lg mt-1">{accuracy.rmse}</div>
            </div>
            <div className="bg-void border border-hairline rounded-md p-3 text-center">
              <div className="eyebrow">MAPE</div>
              <div className="font-mono text-lg mt-1">{accuracy.mape}%</div>
            </div>
            <div className="bg-signal/5 border border-signal/25 rounded-md p-3 text-center">
              <div className="eyebrow text-signal">Accuracy</div>
              <div className="font-mono text-lg mt-1 text-signal">{accuracy.accuracy}%</div>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-3 flex items-center gap-2">
              <Target size={13} /> Forecast vs. actual
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={fva}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  stroke={chartTheme.axis}
                  tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: "short", day: "numeric" })}
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <YAxis stroke={chartTheme.axis} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip contentStyle={chartTheme.tooltip} labelFormatter={(v) => new Date(v).toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#C9A961" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#3FA772" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Panel>
  );
}

const TABS = [
  { id: "trends", label: "Traffic Trends", icon: Activity },
  { id: "peak", label: "Peak Hours", icon: Clock },
  { id: "weather", label: "Weather Impact", icon: CloudRain },
  { id: "comparison", label: "Route Comparison", icon: GitCompare },
  { id: "accuracy", label: "Model Accuracy", icon: Target },
];

export default function Analytics() {
  const { routes, loading: routesLoading } = useRoutes();
  const [tab, setTab] = useState("trends");

  return (
    <div>
      <PageHeader
        eyebrow="Historical Intelligence"
        title="Performance Analytics"
        description="Hourly and daily traffic patterns, weather correlation, cross-route comparison, and forecast accuracy scoring."
      />

      <div className="flex flex-wrap gap-2 mb-6">
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

      {tab === "trends" && <TrendsTab routes={routes} routesLoading={routesLoading} />}
      {tab === "peak" && <PeakHoursTab routes={routes} routesLoading={routesLoading} />}
      {tab === "weather" && <WeatherTab routes={routes} routesLoading={routesLoading} />}
      {tab === "comparison" && <ComparisonTab />}
      {tab === "accuracy" && <AccuracyTab routes={routes} routesLoading={routesLoading} />}
    </div>
  );
}
