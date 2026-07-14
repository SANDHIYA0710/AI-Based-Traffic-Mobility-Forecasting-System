import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LiveAPI } from "../../api/endpoints";
import { useInterval } from "../../hooks/useInterval";
import { StatusBadge } from "../ui/Primitives";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState(null);

  useInterval(() => setNow(new Date()), 1000);

  async function fetchStatus() {
    try {
      const { data } = await LiveAPI.trafficStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  useInterval(fetchStatus, 30000);

  return (
    <header className="h-16 border-b border-hairline bg-panel/70 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-7">
      <div className="flex items-center gap-4">
        <div className="eyebrow">Network Status</div>
        <StatusBadge level={status?.overall_status || "Normal"} />
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="font-mono text-sm text-ink tabular-nums leading-none">
            {now.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="font-mono text-[10px] text-faint tracking-wider mt-1">
            {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>

        <div className="w-px h-8 bg-hairline hidden sm:block" />

        <div className="flex items-center gap-2.5 text-sm text-ink">
          <div className="w-8 h-8 rounded-full border border-accent/30 flex items-center justify-center">
            <User size={13} className="text-accent" />
          </div>
          <span className="hidden sm:block">{user?.username || "User"}</span>
        </div>

        <button
          onClick={logout}
          className="text-muted hover:text-critical transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
