from fastapi import APIRouter

from app.api import (
    auth,
    routes,
    datasets,
    forecast,
    congestion,
    anomaly,
    simulation,
    dashboard,
    analytics,
    report,
    recommendation,
    insight,
    live,
    optimization,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(routes.router)
api_router.include_router(datasets.router)
api_router.include_router(forecast.router)
api_router.include_router(congestion.router)
api_router.include_router(anomaly.router)
api_router.include_router(simulation.router)
api_router.include_router(dashboard.router)
api_router.include_router(analytics.router)
api_router.include_router(report.router)
api_router.include_router(recommendation.router)
api_router.include_router(insight.router)
api_router.include_router(live.router)
api_router.include_router(optimization.router)

