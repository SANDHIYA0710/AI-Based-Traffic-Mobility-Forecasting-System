import { useState } from "react";
import { FlaskConical, History } from "lucide-react";
import { PageHeader, Panel, Button, Select, LoadingState, ErrorState, EmptyState } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { SimulationAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

const SCENARIOS = ["Heavy Rain", "Accident", "Road Work", "Festival", "VIP Movement"];

export default function Simulation() {
  const { routes, loading: routesLoading } = useRoutes();
  const [routeId, setRouteId] = useState(null);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  async function loadHistory(id) {
    try {
      const { data } = await SimulationAPI.history(id);
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }

  function handleRouteChange(id) {
    setRouteId(id);
    setResult(null);
    loadHistory(id);
  }

  async function handleRun() {
    if (!routeId) return;
    setRunning(true);
    setError(null);
    try {
      const { data } = await SimulationAPI.run(routeId, scenario);
      setResult(data);
      loadHistory(routeId);
    } catch (err) {
      setError(apiErrorMessage(err, "Simulation failed — no traffic data for this route."));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="What-if Analysis"
        title="Traffic Simulation"
        description="Model the impact of road closures, weather, and event surges against the latest traffic snapshot for a route."
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
          <div className="w-full md:w-56">
            <Select label="Scenario" value={scenario} onChange={(e) => setScenario(e.target.value)}>
              {SCENARIOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleRun} disabled={!routeId || running}>
            <FlaskConical size={14} /> {running ? "Simulating…" : "Run simulation"}
          </Button>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <div className="eyebrow mb-4">Simulation result</div>
          {error ? (
            <ErrorState message={error} />
          ) : !result ? (
            <EmptyState message="Run a scenario to see projected impact" />
          ) : (
            <div>
              <div className="text-ink font-display text-lg mb-1">
                {result.route} · {result.scenario}
              </div>
              <p className="text-sm text-accent mb-4">{result.recommendation}</p>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="eyebrow">Predicted vehicles</dt>
                  <dd className="font-mono text-lg mt-1">{result.predicted_vehicle_count}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Predicted speed</dt>
                  <dd className="font-mono text-lg mt-1">{result.predicted_speed} km/h</dd>
                </div>
                <div>
                  <dt className="eyebrow">Congestion</dt>
                  <dd className="font-mono text-lg mt-1">{result.predicted_congestion}%</dd>
                </div>
                <div>
                  <dt className="eyebrow">Est. delay</dt>
                  <dd className="font-mono text-lg mt-1 text-critical">{result.estimated_delay_minutes} min</dd>
                </div>
                <div className="col-span-2">
                  <dt className="eyebrow">Projected travel time</dt>
                  <dd className="font-mono text-lg mt-1">{result.travel_time_minutes} min</dd>
                </div>
              </dl>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="eyebrow mb-4 flex items-center gap-2">
            <History size={13} /> Simulation history
          </div>
          {!routeId ? (
            <EmptyState message="Select a route to view its simulation log" />
          ) : history.length === 0 ? (
            <EmptyState message="No simulations run yet for this route" />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h.id} className="bg-void border border-hairline rounded-md px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-ink">{h.scenario_type}</div>
                    <div className="font-mono text-[11px] text-faint mt-0.5">
                      {new Date(h.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-muted">
                    {Math.round(h.predicted_congestion)}% congestion
                    <br />
                    {Math.round(h.predicted_delay)}m delay
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
