import csv
import os

from sqlalchemy.orm import Session

from app.models.route import Route
from app.models.traffic_record import TrafficRecord
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from sqlalchemy import func

from app.models.forecast import Forecast


class ReportService:

    @staticmethod
    def generate_route_report(db: Session, route_id: int):

        route = (
            db.query(Route)
            .filter(Route.id == route_id)
            .first()
        )

        if not route:
            return None

        records = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .order_by(TrafficRecord.timestamp)
            .all()
        )

        os.makedirs("reports", exist_ok=True)

        filename = f"reports/route_{route_id}_report.csv"

        with open(filename, "w", newline="", encoding="utf-8") as file:

            writer = csv.writer(file)

            writer.writerow([
                "Timestamp",
                "Vehicle Count",
                "Average Speed",
                "Congestion",
                "Weather",
                "Temperature",
                "Rainfall"
            ])

            for record in records:

                writer.writerow([
                    record.timestamp,
                    record.vehicle_count,
                    record.average_speed,
                    record.congestion_level,
                    record.weather,
                    record.temperature,
                    record.rainfall
                ])

        return filename
    
    @staticmethod
    def generate_pdf_report(db: Session, route_id: int):

        route = (
            db.query(Route)
            .filter(Route.id == route_id)
            .first()
        )

        if not route:
            return None

        total_records = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .count()
        )

        avg_vehicle = (
            db.query(func.avg(TrafficRecord.vehicle_count))
            .filter(TrafficRecord.route_id == route_id)
            .scalar() or 0
        )

        avg_speed = (
            db.query(func.avg(TrafficRecord.average_speed))
            .filter(TrafficRecord.route_id == route_id)
            .scalar() or 0
        )

        avg_congestion = (
            db.query(func.avg(TrafficRecord.congestion_level))
            .filter(TrafficRecord.route_id == route_id)
            .scalar() or 0
        )

        latest_forecast = (
            db.query(Forecast)
            .filter(Forecast.route_id == route_id)
            .order_by(Forecast.forecast_time.desc())
            .first()
        )

        os.makedirs("reports", exist_ok=True)

        filename = f"reports/route_{route_id}_report.pdf"

        doc = SimpleDocTemplate(filename)

        styles = getSampleStyleSheet()

        story = []

        story.append(
            Paragraph(
                "<b>AI Traffic & Mobility Forecast Report</b>",
                styles["Title"]
            )
        )

        story.append(Spacer(1, 20))

        story.append(Paragraph("<b>Route Information</b>", styles["Heading2"]))
        story.append(Paragraph(f"Route Name : {route.route_name}", styles["BodyText"]))
        story.append(Paragraph(f"Route Code : {route.route_code}", styles["BodyText"]))
        story.append(Paragraph(f"City : {route.city}", styles["BodyText"]))
        story.append(Paragraph(f"Distance : {route.distance_km} km", styles["BodyText"]))

        story.append(Spacer(1, 20))

        story.append(Paragraph("<b>Traffic Summary</b>", styles["Heading2"]))
        story.append(Paragraph(f"Total Records : {total_records}", styles["BodyText"]))
        story.append(Paragraph(f"Average Vehicle Count : {avg_vehicle:.2f}", styles["BodyText"]))
        story.append(Paragraph(f"Average Speed : {avg_speed:.2f} km/h", styles["BodyText"]))
        story.append(Paragraph(f"Average Congestion : {avg_congestion:.2f} %", styles["BodyText"]))

        if latest_forecast:

            story.append(Spacer(1, 20))

            story.append(
                Paragraph(
                    "<b>Latest Prediction</b>",
                    styles["Heading2"]
                )
            )

            story.append(
                Paragraph(
                    f"Forecast Time : {latest_forecast.forecast_time}",
                    styles["BodyText"]
                )
            )

            story.append(
                Paragraph(
                    f"Predicted Vehicles : {latest_forecast.predicted_vehicle_count}",
                    styles["BodyText"]
                )
            )

            story.append(
                Paragraph(
                    f"Predicted Speed : {latest_forecast.predicted_speed:.2f} km/h",
                    styles["BodyText"]
                )
            )

            story.append(
                Paragraph(
                    f"Predicted Congestion : {latest_forecast.predicted_congestion:.2f} %",
                    styles["BodyText"]
                )
            )

        story.append(Spacer(1, 30))

        story.append(
            Paragraph(
                "Generated by AI Traffic & Mobility Forecasting System",
                styles["Italic"]
            )
        )

        doc.build(story)

        return filename