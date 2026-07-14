import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { PageHeader, Panel, Button, Input, LoadingState, ErrorState } from "../components/ui/Primitives";
import { useRoutes } from "../hooks/useRoutes";
import { RoutesAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

const emptyForm = {
  route_code: "",
  route_name: "",
  start_location: "",
  end_location: "",
  distance_km: "",
  city: "",
};

export default function Routes() {
  const { routes, loading, error, refresh } = useRoutes();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  }

  function startEdit(route) {
    setForm({
      route_code: route.route_code,
      route_name: route.route_name,
      start_location: route.start_location,
      end_location: route.end_location,
      distance_km: route.distance_km,
      city: route.city,
    });
    setEditingId(route.id);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    const payload = { ...form, distance_km: parseFloat(form.distance_km) };
    try {
      if (editingId) {
        await RoutesAPI.update(editingId, payload);
      } else {
        await RoutesAPI.create(payload);
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not save route."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this route and all associated data?")) return;
    try {
      await RoutesAPI.remove(id);
      refresh();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete route."));
    }
  }

  if (loading) return <LoadingState label="Loading route registry…" />;
  if (error) return <ErrorState message={apiErrorMessage(error, "Could not load routes.")} />;

  return (
    <div>
      <PageHeader
        eyebrow="Network Registry"
        title="Route Management"
        description="Manage the road segments tracked by the forecasting and monitoring pipeline."
        actions={
          <Button onClick={startCreate}>
            <Plus size={15} /> Add route
          </Button>
        }
      />

      {showForm && (
        <Panel className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="eyebrow">{editingId ? "Edit route" : "New route"}</div>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Route code" required value={form.route_code} onChange={update("route_code")} placeholder="RT-101" />
            <Input label="Route name" required value={form.route_name} onChange={update("route_name")} placeholder="Ring Road North" />
            <Input label="City" required value={form.city} onChange={update("city")} placeholder="Hyderabad" />
            <Input label="Start location" required value={form.start_location} onChange={update("start_location")} placeholder="Gachibowli" />
            <Input label="End location" required value={form.end_location} onChange={update("end_location")} placeholder="Kukatpally" />
            <Input label="Distance (km)" required type="number" step="0.1" value={form.distance_km} onChange={update("distance_km")} placeholder="12.5" />

            <div className="md:col-span-3 flex items-center gap-3 mt-1">
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : editingId ? "Save changes" : "Create route"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              {formError && <span className="text-critical text-xs font-mono">{formError}</span>}
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        {routes.length === 0 ? (
          <p className="text-muted text-sm py-10 text-center">
            No routes registered yet. Add your first route to start ingesting traffic data.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted font-mono text-xs uppercase tracking-wide border-b border-hairline">
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">City</th>
                  <th className="py-2 pr-3">From → To</th>
                  <th className="py-2 pr-3">Distance</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id} className="border-b border-hairline/60 last:border-0">
                    <td className="py-2.5 pr-3 font-mono text-accent">{r.route_code}</td>
                    <td className="py-2.5 pr-3 text-ink">{r.route_name}</td>
                    <td className="py-2.5 pr-3 text-muted">{r.city}</td>
                    <td className="py-2.5 pr-3 text-muted">
                      {r.start_location} → {r.end_location}
                    </td>
                    <td className="py-2.5 pr-3 font-mono">{r.distance_km} km</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => startEdit(r)} className="text-muted hover:text-accent">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="text-muted hover:text-critical">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
