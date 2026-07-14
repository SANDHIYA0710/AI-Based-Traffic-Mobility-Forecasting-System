from sqlalchemy.orm import Session

from app.models.route import Route


class RouteService:

    @staticmethod
    def get_all(db: Session):
        return db.query(Route).all()

    @staticmethod
    def get_by_id(db: Session, route_id: int):
        return db.query(Route).filter(Route.id == route_id).first()

    @staticmethod
    def get_by_code(db: Session, route_code: str):
        return db.query(Route).filter(Route.route_code == route_code).first()

    @staticmethod
    def create(db: Session, route):
        db_route = Route(**route.model_dump())

        db.add(db_route)
        db.commit()
        db.refresh(db_route)

        return db_route

    @staticmethod
    def update(db: Session, route_id: int, route_data):
        route = db.query(Route).filter(Route.id == route_id).first()

        if not route:
            return None

        for key, value in route_data.model_dump().items():
            setattr(route, key, value)

        db.commit()
        db.refresh(route)

        return route

    @staticmethod
    def delete(db: Session, route_id: int):
        route = db.query(Route).filter(Route.id == route_id).first()

        if not route:
            return None

        db.delete(route)
        db.commit()

        return True