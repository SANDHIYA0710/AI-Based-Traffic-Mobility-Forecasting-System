import { api } from "./client";

// ---- Auth ----
export const AuthAPI = {
  register: (payload) => api.post("/auth/register", payload),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  me: () => api.get("/auth/me"),
};

// ---- Routes ----
export const RoutesAPI = {
  list: () => api.get("/routes"),
  get: (id) => api.get(`/routes/${id}`),
  create: (payload) => api.post("/routes", payload),
  update: (id, payload) => api.put(`/routes/${id}`, payload),
  remove: (id) => api.delete(`/routes/${id}`),
};

// ---- Datasets ----
export const DatasetsAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/datasets/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ---- Forecast ----
export const ForecastAPI = {
  train: (routeId) => api.post(`/forecast/train/${routeId}`),
  next24h: (routeId) => api.get(`/forecast/24hours/${routeId}`),
  next7d: (routeId) => api.get(`/forecast/7days/${routeId}`),
};

// ---- Congestion ----
export const CongestionAPI = {
  alerts: () => api.get("/congestion/alerts"),
  peakHours: (routeId) => api.get(`/congestion/peak-hours/${routeId}`),
  predict: (routeId) => api.get(`/congestion/${routeId}`),
};

// ---- Anomaly ----
export const AnomalyAPI = {
  detect: (routeId) => api.get(`/anomaly/detect/${routeId}`),
  summary: (routeId) => api.get(`/anomaly/summary/${routeId}`),
};

// ---- Simulation ----
export const SimulationAPI = {
  run: (routeId, scenario) => api.post(`/simulation/run/${routeId}`, { scenario }),
  history: (routeId) => api.get(`/simulation/history/${routeId}`),
};

// ---- Optimization ----
export const OptimizationAPI = {
  alternativeRoutes: (routeId) => api.get(`/optimization/alternative-routes/${routeId}`),
  bestTravelTime: (routeId) => api.get(`/optimization/best-travel-time/${routeId}`),
  loadBalancing: () => api.get("/optimization/load-balancing"),
};

// ---- Analytics ----
export const AnalyticsAPI = {
  hourly: (routeId) => api.get(`/analytics/hourly/${routeId}`),
  daily: (routeId) => api.get(`/analytics/daily/${routeId}`),
  congestionTrend: (routeId) => api.get(`/analytics/congestion-trend/${routeId}`),
  peakHours: (routeId) => api.get(`/analytics/peak-hours/${routeId}`),
  weatherImpact: (routeId) => api.get(`/analytics/weather-impact/${routeId}`),
  routeComparison: () => api.get("/analytics/route-comparison"),
  forecastVsActual: (routeId) => api.get(`/analytics/forecast-vs-actual/${routeId}`),
  modelAccuracy: (routeId) => api.get(`/analytics/model-accuracy/${routeId}`),
};

// ---- Dashboard ----
export const DashboardAPI = {
  get: () => api.get("/dashboard/"),
};

// ---- Live ----
export const LiveAPI = {
  overview: () => api.get("/live/overview"),
  routes: () => api.get("/live/routes"),
  criticalRoutes: () => api.get("/live/critical-routes"),
  trafficStatus: () => api.get("/live/traffic-status"),
};

// ---- Recommendation ----
export const RecommendationAPI = {
  get: (routeId) => api.get(`/recommendation/${routeId}`),
};

// ---- Insight ----
export const InsightAPI = {
  get: (routeId) => api.get(`/insights/${routeId}`),
};

// ---- Reports ----
export const ReportsAPI = {
  csvUrl: (routeId, base) => `${base}/reports/route/${routeId}`,
  pdfUrl: (routeId, base) => `${base}/reports/pdf/${routeId}`,
};
