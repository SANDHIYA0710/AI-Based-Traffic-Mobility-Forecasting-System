import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  RadioTower,
  Gauge,
  Map,
  UploadCloud,
  TrendingUp,
  AlertOctagon,
  Waves,
  FlaskConical,
  Route as RouteIcon,
  BarChart3,
  Lightbulb,
  FileOutput,
  Compass,
} from "lucide-react";

const groups = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Executive Dashboard", icon: Gauge, end: true },
      { to: "/live", label: "Real-Time Monitoring", icon: RadioTower },
      { to: "/congestion", label: "Congestion Intelligence", icon: AlertOctagon },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/forecast", label: "Traffic Forecasting", icon: TrendingUp },
      { to: "/anomaly", label: "Traffic Anomaly Detection", icon: Waves },
      { to: "/optimization", label: "Mobility Optimization", icon: Compass },
      { to: "/simulation", label: "Traffic Simulation", icon: FlaskConical },
    ],
  },
  {
    label: "Analysis",
    items: [
      { to: "/analytics", label: "Performance Analytics", icon: BarChart3 },
      { to: "/insights", label: "AI Insights & Recommendation", icon: Lightbulb },
      { to: "/reports", label: "Reporting Center", icon: FileOutput },
    ],
  },
  {
    label: "Network",
    items: [
      { to: "/routes", label: "Route Management", icon: RouteIcon },
      { to: "/datasets", label: "Traffic Data Management", icon: UploadCloud },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-hairline h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-6 border-b border-hairline flex items-center gap-3">
        <div className="w-9 h-9 rounded-full border border-accent/40 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-accent/[0.06]" />
          <Map size={15} className="text-accent relative" />
        </div>
        <div>
          <div className="font-display font-semibold text-ink leading-none tracking-wide text-[15px]">
            TrafficFlow AI
          </div>
          <div className="font-mono text-[9px] text-faint tracking-[0.2em] mt-1.5">
            MOBILITY INTELLIGENCE SUITE
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-7">
        {groups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className="gold-rule mb-5 mx-2 opacity-40" />}
            <div className="eyebrow px-3 mb-2.5">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      "relative flex items-center gap-2.5 pl-3 pr-2.5 py-2.5 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-accent/[0.08] text-accent"
                        : "text-muted hover:text-ink hover:bg-hairline/20"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent" />
                      )}
                      <item.icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-hairline">
        <div className="font-mono text-[10px] text-faint tracking-widest">
          AI-POWERED TRAFFIC &amp; MOBILITY FORECASTING
        </div>
      </div>
    </aside>
  );
}
