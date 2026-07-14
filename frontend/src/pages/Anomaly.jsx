import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { Waves } from "lucide-react";
import { PageHeader, Panel, LoadingState, ErrorState, EmptyState } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { AnomalyAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

export default function Anomaly() {
  const { routes, loading: routesLoading } = useRoutes();
  const [routeId, setRouteId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleRouteChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const [sumRes, detectRes] = await Promise.all([
        AnomalyAPI.summary(id),
        AnomalyAPI.detect(id),
      ]);
      setSummary(sumRes.data);
      setAnomalies(detectRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Not enough data to run anomaly detection (minimum 20 records)."));
      setSummary(null);
      setAnomalies(null);
    } finally {
      setLoading(false);
    }
  }

  const chartData = (anomalies || []).map((a) => ({
    x: new Date(a.timestamp).getTime(),
    y: a.vehicle_count,
    reason: a.reason,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Isolation Forest"
        title="Traffic Anomaly Detection"
        description="Flags sudden spikes, unexpected drops, and sensor irregularities in per-route vehicle counts."
      />

      <Panel className="mb-6">
        <div className="w-full md:w-72">
          {routesLoading ? (
            <LoadingState label="Loading routes…" />
          ) : (
            <RouteSelect routes={routes} value={routeId} onChange={handleRouteChange} />
          )}
        </div>
      </Panel>

      {!routeId ? (
        <Panel>
          <EmptyState message="Select a route to scan for anomalies" />
        </Panel>
      ) : loading ? (
        <LoadingState label="Running isolation forest…" />
      ) : error ? (
        <Panel>
          <ErrorState message={error} />
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Panel>
              <div className="eyebrow">Total records</div>
              <div className="font-display text-2xl font-semibold mt-1">{summary.total_records}</div>
            </Panel>
            <Panel>
              <div className="eyebrow text-signal">Normal</div>
              <div className="font-display text-2xl font-semibold mt-1 text-signal">{summary.normal_records}</div>
            </Panel>
            <Panel>
              <div className="eyebrow text-critical">Anomalies</div>
              <div className="font-display text-2xl font-semibold mt-1 text-critical">{summary.anomalies}</div>
            </Panel>
            <Panel>
              <div className="eyebrow">Anomaly rate</div>
              <div className="font-display text-2xl font-semibold mt-1">{summary.anomaly_percentage}%</div>
            </Panel>
          </div>

          <Panel>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <Waves size={13} /> Detected anomalies over time
            </div>
            {chartData.length === 0 ? (
              <EmptyState message="No anomalies detected" hint="Traffic on this route has been within expected bounds." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart>
                  <CartesianGrid stroke="#242838" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: "short", day: "numeric" })}
                    stroke="#5C594E"
                    tick={{ fontSize: 11, fontFamily: "monospace" }}
                  />
                  <YAxis dataKey="y" stroke="#5C594E" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <ZAxis range={[60, 60]} />
                  <Tooltip
                    contentStyle={{ background: "#12141C", border: "1px solid #2B2E3C", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(v) => new Date(v).toLocaleString()}
                  />
                  <Scatter data={chartData} fill="#C7554A" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
