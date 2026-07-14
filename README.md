# AI-Based Traffic & Mobility Forecasting System

Full-stack platform that predicts traffic conditions and generates mobility
insights from historical traffic data — forecasting, congestion alerts,
anomaly detection, scenario simulation, and route optimization, with a
FastAPI backend and a React ops-console frontend.

## Architecture

```
traffic-mobility-ai/
├── backend/ 
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── core/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/
        ├── pages/
        └── components/
```

Layers are kept separate on purpose: routers only handle HTTP concerns,
services hold the domain logic, and `ml/` isolates anything touching
Prophet/scikit-learn so the forecasting approach can change without
touching the API surface.

## Dataset

Traffic data is uploaded via CSV (`POST /datasets/upload`) into the
`traffic_records` table, one row per route per timestamp:

| Column             | Description                              |
|--------------------|-------------------------------------------|
| `route_id`         | Foreign key to `routes`                    |
| `timestamp`        | Reading time                               |
| `vehicle_count`    | Vehicles observed in the interval          |
| `average_speed`    | Average speed on the route (km/h)          |
| `congestion_level` | 0–100 congestion score                     |
| `weather`          | Optional weather condition label           |
| `temperature`      | Optional, °C                               |
| `rainfall`         | Optional, mm                               |

Routes (`routes` table) carry `route_code`, `route_name`, start/end
location, `distance_km`, and `city` — the `city` field is what the
optimization engine uses to group routes when suggesting alternatives.

## Forecasting methodology

Each route gets its own **Prophet** model (`POST /forecast/train/{route_id}`),
trained on that route's historical `vehicle_count` time series. Predictions
are generated for the next 24 hours or 7 days and persisted to the
`forecasts` table (`predicted_vehicle_count`, `predicted_speed`,
`predicted_congestion`, `confidence_score`), so downstream features
(congestion alerts, peak-hour detection, optimization) read from stored
forecasts rather than retraining on every request.

Model accuracy is tracked via `/analytics/model-accuracy/{route_id}`
(MAE / RMSE / MAPE against held-out actuals).

## Anomaly detection

`/anomaly/detect/{route_id}` runs **Isolation Forest** over recent traffic
records to flag sudden spikes, unexpected drops, and sensor-level outliers
that a simple threshold would miss. `/anomaly/summary/{route_id}` aggregates
detected anomalies for the dashboard.

## Congestion alerts

`/congestion/alerts` scans every active route's 24-hour forecast and raises
plain-language alerts (e.g. "High congestion expected on Route A between
8–10 AM") wherever predicted congestion crosses a threshold.
`/congestion/peak-hours/{route_id}` ranks the top forecasted congestion
windows for a single route.

## Mobility optimization engine

Three endpoints under `/optimization`:

- **`/alternative-routes/{route_id}`** — compares the route's average
  congestion against other active routes in the same city and surfaces
  ones that are meaningfully less congested, with an estimated time-saved
  percentage.
- **`/best-travel-time/{route_id}`** — scans the route's next-24-hour
  forecast for the lowest- and highest-congestion windows and recommends
  the best time to travel.
- **`/load-balancing`** — classifies every route as overloaded (≥70%
  average congestion), balanced, or underutilized (<40%), and suggests
  which overloaded routes should redirect traffic to which underutilized
  ones.

## Scenario simulation

`/simulation/run/{route_id}` applies a scenario multiplier (rain, road
closure, festival/event surge, accident, VIP movement) to a route's
current traffic profile and estimates the resulting delay and congestion
impact. `/simulation/history/{route_id}` returns past simulation runs.

## Auth & security

JWT access + refresh tokens (`python-jose`), password hashing via
`pwdlib` (Argon2). Dataset upload and model training are auth-protected;
read endpoints are open for the eval demo — see `app/core/dependencies.py`
to tighten this for production use.

## Running locally

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt --break-system-packages
uvicorn app.main:app --reload
```
API docs at `http://localhost:8000/docs`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`, configured via `frontend/.env`
(`VITE_API_BASE_URL`) to talk to the backend above.

## Known scope limitations

- Forecasting uses Prophet only — no LSTM/ARIMA ensemble or weather/holiday
  regressors feeding the model yet, though the data columns exist.
- Training runs synchronously in the request thread rather than as a
  background job.
- No automated test suite in this iteration.


### Author
###### Syed Mahammad Shareef
###### Python Developer
