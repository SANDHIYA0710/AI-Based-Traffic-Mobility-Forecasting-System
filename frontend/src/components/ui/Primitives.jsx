import clsx from "clsx";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";

export function Panel({ className, children, ...props }) {
  return (
    <div className={clsx("panel p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 pb-6 border-b border-hairline">
      <div>
        {eyebrow && (
          <div className="eyebrow mb-2 flex items-center gap-2">
            <span className="w-4 h-px bg-accent/60" />
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold text-ink tracking-wide">
          {title}
        </h1>
        {description && (
          <p className="text-muted text-sm mt-2 max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Button({ variant = "primary", className, children, ...props }) {
  const styles = {
    primary:
      "bg-accent text-void hover:bg-accent/90 shadow-glow font-semibold tracking-wide",
    ghost:
      "bg-transparent border border-hairline text-ink hover:border-accent/60 hover:text-accent",
    danger:
      "bg-transparent border border-critical/40 text-critical hover:bg-critical/10",
    subtle: "bg-panelraised text-ink hover:bg-hairline/40 border border-hairline",
  };
  return (
    <button
      className={clsx(
        "px-4 py-2.5 rounded-lg text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 justify-center",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className, ...props }) {
  return (
    <label className="block">
      {label && <span className="eyebrow block mb-1.5">{label}</span>}
      <input
        className={clsx(
          "w-full bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent/60 outline-none transition-colors",
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Select({ label, className, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="eyebrow block mb-1.5">{label}</span>}
      <select
        className={clsx(
          "w-full bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent/60 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function StatusBadge({ level }) {
  const map = {
    High: { dot: "led-red", text: "text-critical", label: "High" },
    Critical: { dot: "led-red", text: "text-critical", label: "Critical" },
    Heavy: { dot: "led-red", text: "text-critical", label: "Heavy" },
    Moderate: { dot: "led-caution", text: "text-caution", label: "Moderate" },
    Medium: { dot: "led-caution", text: "text-caution", label: "Medium" },
    Low: { dot: "led-green", text: "text-signal", label: "Low" },
    Normal: { dot: "led-green", text: "text-signal", label: "Normal" },
  };
  const s = map[level] || { dot: "led-caution", text: "text-muted", label: level || "—" };
  return (
    <span className={clsx("inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wide", s.text)}>
      <span className={s.dot} />
      {s.label}
    </span>
  );
}

export function LoadingState({ label = "Fetching telemetry…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <Loader2 className="animate-spin" size={22} />
      <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function ErrorState({ message = "Unable to reach the API." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-critical text-center px-6">
      <AlertTriangle size={22} />
      <span className="font-mono text-xs uppercase tracking-widest">{message}</span>
    </div>
  );
}

export function EmptyState({ message = "No data yet.", hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted text-center px-6">
      <Inbox size={22} />
      <span className="font-mono text-xs uppercase tracking-widest">{message}</span>
      {hint && <span className="text-xs text-faint max-w-sm">{hint}</span>}
    </div>
  );
}
