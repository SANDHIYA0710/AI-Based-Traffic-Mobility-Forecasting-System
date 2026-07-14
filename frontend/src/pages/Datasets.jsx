import { useRef, useState } from "react";
import { UploadCloud, FileCheck2 } from "lucide-react";
import { PageHeader, Panel, Button, ErrorState } from "../components/ui/Primitives";
import { DatasetsAPI } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

export default function Datasets() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  function pickFile(f) {
    if (f && f.name.endsWith(".csv")) {
      setFile(f);
      setResult(null);
      setError(null);
    } else {
      setError("Only .csv files are accepted.");
    }
  }

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await DatasetsAPI.upload(file);
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Ingestion"
        title="Traffic Data Management"
        description="Upload historical traffic CSVs. Required columns: timestamp, route_code, vehicle_count, average_speed, congestion_level."
      />

      <Panel className="max-w-2xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg py-14 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-hairline hover:border-accent/40"
          }`}
        >
          <UploadCloud size={26} className="text-muted" />
          <div className="text-sm text-ink">
            {file ? file.name : "Drop a CSV here, or click to browse"}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button onClick={handleUpload} disabled={!file || busy}>
            {busy ? "Uploading…" : "Upload dataset"}
          </Button>
          {error && <span className="text-critical text-xs font-mono">{error}</span>}
        </div>

        {result && (
          <div className="mt-6 bg-signal/5 border border-signal/25 rounded-md p-4 flex items-start gap-3">
            <FileCheck2 size={18} className="text-signal mt-0.5" />
            <div className="text-sm">
              <div className="text-ink font-medium">{result.filename} ingested.</div>
              <div className="font-mono text-xs text-muted mt-1">
                {result.total_rows} rows read · {result.inserted} inserted · {result.skipped} skipped
                (unmatched route codes or bad rows)
              </div>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
