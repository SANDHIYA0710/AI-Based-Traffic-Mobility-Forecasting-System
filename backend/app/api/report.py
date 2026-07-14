from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.report_service import ReportService

router = APIRouter(
    prefix="/reports",
    tags=["Reporting Center"]
)


@router.get("/route/{route_id}")
def route_report(
    route_id: int,
    db: Session = Depends(get_db)
):

    filename = ReportService.generate_route_report(
        db,
        route_id
    )

    if filename is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    return FileResponse(
        filename,
        media_type="text/csv",
        filename=f"route_{route_id}_report.csv"
    )

@router.get("/pdf/{route_id}")
def pdf_report(
    route_id: int,
    db: Session = Depends(get_db)
):

    filename = ReportService.generate_pdf_report(
        db,
        route_id
    )

    if filename is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=f"route_{route_id}_report.pdf"
    )