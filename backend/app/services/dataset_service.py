import pandas as pd

from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.models.route import Route
from app.models.traffic_record import TrafficRecord


class DatasetService:

    @staticmethod
    def upload_dataset(db: Session, file_path, filename, user_id):

        df = pd.read_csv(file_path)

        total_rows = len(df)

        inserted = 0
        skipped = 0

        for _, row in df.iterrows():

            route = (
                db.query(Route)
                .filter(Route.route_code == str(row["route_code"]).strip())
                .first()
            )

            if route is None:
                skipped += 1
                continue

            try:

                traffic = TrafficRecord(
                    route_id=route.id,
                    timestamp=pd.to_datetime(row["timestamp"]),
                    vehicle_count=int(row["vehicle_count"]),
                    average_speed=float(row["average_speed"]),
                    congestion_level={"Low": 0.3, "Medium": 0.6, "High": 0.9}.get(str(row["congestion_level"]).strip(), 0.0),
                    weather=row.get("weather"),
                    temperature=row.get("temperature"),
                    rainfall=row.get("rainfall"),
                )

                db.add(traffic)
                inserted += 1

            except Exception as e:
                print("=" * 60)
                print("ERROR OCCURRED")
                print(e)
                print(row)
                print("=" * 60)
                skipped += 1


        # Save dataset history
        dataset = Dataset(
            file_name=filename,
            total_records=total_rows,
            status="uploaded",
            uploaded_by=user_id,
        )

        db.add(dataset)

        # Commit everything
        db.commit()

        # Refresh dataset object
        db.refresh(dataset)

        return {
            "dataset_id": dataset.id,
            "filename": filename,
            "total_rows": total_rows,
            "inserted": inserted,
            "skipped": skipped,
        }