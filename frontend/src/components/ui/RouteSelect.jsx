import { Select } from "./Primitives";

export default function RouteSelect({ routes, value, onChange, label = "Route" }) {
  return (
    <Select label={label} value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}>
      <option value="" disabled>
        Select a route…
      </option>
      {routes.map((r) => (
        <option key={r.id} value={r.id}>
          {r.route_code} — {r.route_name}
        </option>
      ))}
    </Select>
  );
}
