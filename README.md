# TrafficFlow AI

**An AI-powered traffic forecasting and mobility intelligence platform.**

TrafficFlow AI ingests historical traffic data and turns it into forward-looking operational intelligence — per-route demand forecasts, congestion alerts, anomaly detection, scenario simulation, and route optimization — served through a FastAPI backend and a React dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Forecasting Engine](#forecasting-engine)
- [Anomaly Detection](#anomaly-detection)
- [Congestion Intelligence](#congestion-intelligence)
- [Mobility Optimization](#mobility-optimization)
- [Scenario Simulation](#scenario-simulation)
- [Authentication & Security](#authentication--security)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

Cities and logistics operators generate constant streams of traffic data but rarely turn it into forward-looking action. TrafficSense AI closes that gap: it trains a dedicated forecasting model per route, watches for abnormal traffic behavior in real time, and surfaces concrete recommendations — which route to take, when to travel, and where to redirect load — rather than just charts.

The system is built as two independently deployable services:

| Layer | Responsibility |
|---|---|
| **Backend** (FastAPI) | Data ingestion, ML training/inference, business logic, REST API |
| **Frontend** (React) | Dashboards, visual analytics, simulation controls, reporting UI |

---

## Core Capabilities

- 📈 **Per-route demand forecasting** — 24-hour and 7-day vehicle volume predictions
- 🚨 **Automated congestion alerts** — plain-language warnings before congestion peaks
- ⚠️ **Anomaly detection** — flags abnormal spikes, drops, and sensor irregularities
- 🧭 **Mobility optimization** — alternative-route suggestions and network load balancing
- 🧪 **Scenario simulation** — model the impact of rain, closures, events, and accidents
- 📊 **Performance analytics** — historical trends, weather correlation, model accuracy scoring
- 📄 **Reporting** — CSV exports and formatted PDF summaries per route
- 🔐 **JWT-secured API** — token-based auth with role-aware access

---

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy ORM (SQLite / PostgreSQL)
- Prophet (time-series forecasting)
- scikit-learn (Isolation Forest for anomaly detection)
- pandas / numpy / statsmodels
- python-jose (JWT) + pwdlib (Argon2 password hashing)
- ReportLab (PDF report generation)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Recharts (data visualization)
- React Router

---

## System Architecture

```
trafficsense-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # HTTP routers — request/response only, no business logic
│   │   ├── services/      # Domain logic (forecast orchestration, alerts, optimization)
│   │   ├── ml/             # Forecasting models, anomaly detection, model comparison
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   └── core/          # Config, security, dependencies
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/           # Axios client + endpoint definitions
        ├── pages/         # One page per feature domain
        └── components/    # Shared layout, UI primitives, charts
```

The layering is deliberate: routers stay thin and only handle HTTP concerns, `services/` owns the actual domain logic, and `ml/` isolates every Prophet/scikit-learn touchpoint — so the forecasting approach can evolve (e.g. adding LSTM or an ensemble) without changing the API surface consumers depend on.

---

## Data Model

Traffic data is ingested via CSV upload (`POST /datasets/upload`) into the `traffic_records` table — one row per route per timestamp:

| Column | Type | Description |
|---|---|---|
| `route_id` | FK → `routes` | Which route this reading belongs to |
| `timestamp` | datetime | Reading time |
| `vehicle_count` | int | Vehicles observed in the interval |
| `average_speed` | float | Average speed on the route (km/h) |
| `congestion_level` | float | 0–100 congestion score |
| `weather` | string, optional | Weather condition label |
| `temperature` | float, optional | °C |
| `rainfall` | float, optional | mm |

Routes (`routes` table) carry `route_code`, `route_name`, start/end location, `distance_km`, and `city`. The `city` field is what the optimization engine uses to group routes when comparing congestion and suggesting alternatives.

---

## Forecasting Engine

Each route trains its own **Prophet** model:

```
POST /forecast/train/{route_id}
```

trained on that route's historical `vehicle_count` time series with daily and weekly seasonality. Predictions are generated for the next 24 hours or 7 days and **persisted** to the `forecasts` table (`predicted_vehicle_count`, `predicted_speed`, `predicted_congestion`, `confidence_score`) — so downstream features (congestion alerts, peak-hour detection, optimization) read from stored forecasts instead of retraining on every request.

Model accuracy is tracked continuously via:

```
GET /analytics/model-accuracy/{route_id}
```

which reports MAE, RMSE, and MAPE against held-out actuals.

---

## Anomaly Detection

```
GET /anomaly/detect/{route_id}
```

Runs **Isolation Forest** over recent traffic records to flag sudden spikes, unexpected drops, and sensor-level outliers that a fixed threshold would miss — because "abnormal" looks different on a highway at rush hour than it does on a residential street at 2 AM.

```
GET /anomaly/summary/{route_id}
```

Aggregates detected anomalies for dashboard display.

---

## Congestion Intelligence

```
GET /congestion/alerts
```

Scans every active route's 24-hour forecast and raises plain-language alerts — *"High congestion expected on Route A between 8–10 AM"* — wherever predicted congestion crosses threshold.

```
GET /congestion/peak-hours/{route_id}
```

Ranks the top forecasted congestion windows for a single route.

---

## Mobility Optimization

Three endpoints under `/optimization`:

| Endpoint | What it does |
|---|---|
| `GET /optimization/alternative-routes/{route_id}` | Compares this route's average congestion against other active routes in the same city and surfaces meaningfully-less-congested alternatives, with an estimated time-saved percentage |
| `GET /optimization/best-travel-time/{route_id}` | Scans the next-24-hour forecast for the lowest- and highest-congestion windows and recommends the best time to travel |
| `GET /optimization/load-balancing` | Classifies every route as **overloaded** (≥70% avg congestion), **balanced**, or **underutilized** (<40%), and suggests which overloaded routes should redirect traffic to which underutilized ones |

---

## Scenario Simulation

```
POST /simulation/run/{route_id}
```

Applies a scenario multiplier — rain, road closure, festival/event surge, accident, VIP movement — to a route's current traffic profile and estimates the resulting delay and congestion impact.

```
GET /simulation/history/{route_id}
```

Returns past simulation runs for comparison.

---

## Authentication & Security

- JWT access tokens via `python-jose`
- Password hashing via `pwdlib` (Argon2)
- Dataset upload and model training endpoints are auth-protected
- Read endpoints are open in this build for demo/evaluation purposes — see `app/core/dependencies.py` to tighten access control for production

---

## API Reference

Full interactive documentation is auto-generated by FastAPI and available at:

```
http://localhost:8000/docs
```

Grouped by domain: **Authentication · Route Management · Traffic Data Management · Traffic Forecasting · Congestion Intelligence · Traffic Anomaly Detection · Traffic Simulation · Executive Dashboard · Performance Analytics · Reporting Center · AI Insights & Recommendation · Real-Time Monitoring · Mobility Optimization**

---

## Getting Started

### Prerequisites

- Python 3.12+ (required for current numpy/scipy pins)
- Node.js 18+
- A C++ build toolchain for Prophet/CmdStan on first install (see Prophet's [installation notes](https://facebook.github.io/prophet/docs/installation.html) for platform-specific setup)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`, configured via `frontend/.env` (`VITE_API_BASE_URL`) to talk to the backend above.

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=sqlite:///./traffic.db
SECRET_KEY=your-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Generate a secure `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Project Structure

```
backend/app/
├── api/            # Routers: auth, routes, datasets, forecast, congestion,
│                   # anomaly, simulation, dashboard, analytics, reports,
│                   # recommendation, insights, live, optimization
├── services/       # Business logic layer
├── ml/             # forecast_factory.py, model_comparison.py, prophet_model.py
├── models/         # SQLAlchemy models: User, Route, TrafficData, Forecast,
│                   # Anomaly, Simulation, Dataset, ForecastHistory
├── schemas/        # Pydantic request/response contracts
└── core/           # config.py, security.py, dependencies.py

frontend/src/
├── api/            # client.js, endpoints.js
├── pages/          # Dashboard, Forecast, Congestion, Anomaly, Simulation,
│                   # Analytics, Insights, Reports, Routes, Datasets,
│                   # LiveMonitoring, Optimization, Login, Register
└── components/
    ├── layout/     # AppShell, Sidebar, Topbar, ProtectedRoute
    ├── ui/          # Primitives (Panel, Button, Input, StatusBadge, etc.)
    └── charts/      # RadarConsole and other visualizations
```

---

## Roadmap

- [ ] Ensemble forecasting — blend Prophet with LSTM/ARIMA rather than Prophet alone
- [ ] Feed weather and holiday regressors into the forecasting model (columns already exist in the schema)
- [ ] Move model training off the request thread into a background job queue
- [ ] Automated test suite (unit + integration)
- [ ] Role-based access control for production deployments
- [ ] WebSocket-based live traffic feed instead of polling

---

## Author

**Sandhiya K**
Python Developer
