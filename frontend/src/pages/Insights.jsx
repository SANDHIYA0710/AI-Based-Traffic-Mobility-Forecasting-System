import { useState } from "react";
import { Lightbulb, Navigation } from "lucide-react";
import { PageHeader, Panel, LoadingState, ErrorState, EmptyState, StatusBadge } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { InsightAPI, RecommendationAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

export default function Insights() {
  const { routes, loading: routesLoading } = useRoutes();
  const [routeId, setRouteId] = useState(null);
  const [insight, setInsight] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(id) {
    setRouteId(id);
    setLoading(true);
    setError(null);
    try {
      const [insightRes, recRes] = await Promise.all([
        InsightAPI.get(id),
        RecommendationAPI.get(id),
      ]);
      setInsight(insightRes.data);
      setRecommendation(recRes.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Generated Guidance"
        title="AI Insights & Recommendation"
        description="Plain-language summaries of route behavior, plus an actionable travel recommendation based on the latest forecast."
      />

      <Panel className="mb-6">
        <div className="w-full md:w-72">
          {routesLoading ? <LoadingState label="Loading routes…" /> : <RouteSelect routes={routes} value={routeId} onChange={handleChange} />}
        </div>
      </Panel>

      {!routeId ? (
        <Panel>
          <EmptyState message="Select a route to generate insights" />
        </Panel>
      ) : loading ? (
        <LoadingState label="Synthesizing route intelligence…" />
      ) : error ? (
        <Panel>
          <ErrorState message={error} />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <Lightbulb size={13} /> Route insight
            </div>
            {insight.message ? (
              <EmptyState message={insight.message} />
            ) : (
              <div>
                <p className="text-sm text-ink leading-relaxed mb-5">{insight.ai_insight}</p>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="eyebrow">Avg. vehicles</dt>
                    <dd className="font-mono mt-1">{insight.average_vehicle_count}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Avg. speed</dt>
                    <dd className="font-mono mt-1">{insight.average_speed} km/h</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Avg. congestion</dt>
                    <dd className="font-mono mt-1">{insight.average_congestion}%</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Peak / trough</dt>
                    <dd className="font-mono mt-1">
                      {insight.maximum_vehicle_count} / {insight.minimum_vehicle_count}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </Panel>

          <Panel>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <Navigation size={13} /> Travel recommendation
            </div>
            {recommendation.message ? (
              <EmptyState message={recommendation.message} hint="Train a forecast model for this route to unlock recommendations." />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge level={recommendation.traffic_status} />
                  <span className="font-mono text-xs text-faint">{recommendation.confidence} confidence</span>
                </div>
                <p className="text-sm text-accent mb-5">{recommendation.recommendation}</p>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="eyebrow">Predicted vehicles</dt>
                    <dd className="font-mono mt-1">{recommendation.predicted_vehicle_count}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Predicted speed</dt>
                    <dd className="font-mono mt-1">{recommendation.predicted_speed} km/h</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Est. delay</dt>
                    <dd className="font-mono mt-1 text-critical">{recommendation.estimated_delay_minutes} min</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Est. time saved</dt>
                    <dd className="font-mono mt-1 text-signal">{recommendation.estimated_time_saved} min</dd>
                  </div>
                </dl>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
