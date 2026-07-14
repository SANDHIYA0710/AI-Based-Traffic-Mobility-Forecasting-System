import { useState } from "react";
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import { PageHeader, Panel, Button, LoadingState, EmptyState } from "../components/ui/Primitives";
import RouteSelect from "../components/ui/RouteSelect";
import { useRoutes } from "../hooks/useRoutes";
import { ReportsAPI } from "../api/endpoints";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function Reports() {
  const { routes, loading: routesLoading } = useRoutes();
  const [routeId, setRouteId] = useState(null);

  const selectedRoute = routes.find((r) => r.id === routeId);

  return (
    <div>
      <PageHeader
        eyebrow="Export"
        title="Reporting Center"
        description="Generate a CSV export of raw traffic records, or a formatted PDF summary, for a single route."
      />

      <Panel className="max-w-xl">
        <div className="mb-6">
          {routesLoading ? <LoadingState label="Loading routes…" /> : <RouteSelect routes={routes} value={routeId} onChange={setRouteId} />}
        </div>

        {!routeId ? (
          <EmptyState message="Select a route to enable exports" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-void border border-hairline rounded-md px-4 py-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={18} className="text-signal" />
                <div>
                  <div className="text-sm text-ink">CSV — raw traffic records</div>
                  <div className="font-mono text-[11px] text-faint">
                    route_{routeId}_report.csv
                  </div>
                </div>
              </div>
              <a href={ReportsAPI.csvUrl(routeId, API_BASE)} target="_blank" rel="noreferrer">
                <Button variant="subtle">
                  <Download size={14} /> Download
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-between bg-void border border-hairline rounded-md px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-accent" />
                <div>
                  <div className="text-sm text-ink">PDF — formatted summary</div>
                  <div className="font-mono text-[11px] text-faint">
                    route_{routeId}_report.pdf
                  </div>
                </div>
              </div>
              <a href={ReportsAPI.pdfUrl(routeId, API_BASE)} target="_blank" rel="noreferrer">
                <Button variant="subtle">
                  <Download size={14} /> Download
                </Button>
              </a>
            </div>

            {selectedRoute && (
              <p className="text-xs text-faint font-mono mt-2">
                {selectedRoute.route_name} · {selectedRoute.city}
              </p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
