"""Map routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.map.schemas import MapRecomputeResponse, MapUserResponse
from app.features.map.service import MapService

router = APIRouter(prefix="/map", tags=["Map"])
service = MapService()


@router.post("/recompute", response_model=MapRecomputeResponse)
def recompute_map_positions(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    return service.recompute_map_positions(db)


@router.get("/users", response_model=list[MapUserResponse])
def get_map_users(db: Session = Depends(get_db)):
    return service.list_map_users(db)
