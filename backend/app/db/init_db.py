from app.db.database import Base, engine

from app.models import (
    User,
    Route,
    Dataset,
    Forecast,
    Simulation,
)


def init_db():
    Base.metadata.create_all(bind=engine)