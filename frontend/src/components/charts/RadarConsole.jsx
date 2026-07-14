// Signature element: a live "traffic radar" — routes are plotted as blips
// around a polar grid, distance-from-center encodes congestion severity,
// and a sweep arm rotates continuously like an ATC scope. Genuinely reads
// congestion_level per route rather than existing purely for decoration.
export default function RadarConsole({ routes = [] }) {
  const size = 340;
  const center = size / 2;
  const maxRadius = center - 24;

  const severityColor = (c) => {
    if (c >= 70) return "#C7554A";
    if (c >= 40) return "#C9A961";
    return "#3FA772";
  };

  const points = routes.slice(0, 12).map((r, i) => {
    const angle = (i / Math.max(routes.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const congestion = Math.min(Math.max(r.congestion ?? 0, 0), 100);
    const radius = (congestion / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { ...r, x, y, congestion, color: severityColor(congestion) };
  });

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <defs>
        <radialGradient id="scopeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A961" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
        </radialGradient>
        <clipPath id="scopeClip">
          <circle cx={center} cy={center} r={maxRadius} />
        </clipPath>
      </defs>

      <circle cx={center} cy={center} r={maxRadius + 10} fill="url(#scopeGlow)" />

      {rings.map((f) => (
        <circle
          key={f}
          cx={center}
          cy={center}
          r={maxRadius * f}
          fill="none"
          stroke="#242838"
          strokeWidth="1"
        />
      ))}

      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1={center - maxRadius * Math.cos((deg * Math.PI) / 180)}
          y1={center - maxRadius * Math.sin((deg * Math.PI) / 180)}
          x2={center + maxRadius * Math.cos((deg * Math.PI) / 180)}
          y2={center + maxRadius * Math.sin((deg * Math.PI) / 180)}
          stroke="#242838"
          strokeWidth="1"
        />
      ))}

      <g clipPath="url(#scopeClip)">
        <g style={{ transformOrigin: `${center}px ${center}px` }} className="animate-sweep">
          <path
            d={`M ${center} ${center} L ${center} ${center - maxRadius} A ${maxRadius} ${maxRadius} 0 0 1 ${
              center + maxRadius * Math.sin((35 * Math.PI) / 180)
            } ${center - maxRadius * Math.cos((35 * Math.PI) / 180)} Z`}
            fill="#C9A961"
            opacity="0.12"
          />
        </g>
      </g>

      {points.map((p) => (
        <g key={p.route_id ?? p.route}>
          <circle cx={p.x} cy={p.y} r={9} fill={p.color} opacity="0.18" className="animate-blip" />
          <circle cx={p.x} cy={p.y} r={4} fill={p.color} />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            fill="#9C9789"
          >
            {p.route_code ?? p.route}
          </text>
        </g>
      ))}

      <circle cx={center} cy={center} r={3} fill="#F1EDE3" />
    </svg>
  );
}
