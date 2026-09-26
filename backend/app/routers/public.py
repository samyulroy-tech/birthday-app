from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, auth, schemas

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/config", response_model=schemas.ConfigPublicOut)
def get_public_config(slug: str = "default", db: Session = Depends(get_db)):
    cfg = crud.get_config(db, slug)
    if not cfg:
        raise HTTPException(status_code=404, detail="This surprise hasn't been set up yet")
    return cfg


@router.post("/verify-password", response_model=schemas.VerifyPasswordResponse)
def verify_password(payload: schemas.VerifyPasswordRequest, slug: str = "default", db: Session = Depends(get_db)):
    cfg = crud.get_config(db, slug)
    if not cfg:
        raise HTTPException(status_code=404, detail="This surprise hasn't been set up yet")
    valid = auth.verify_password(payload.password.strip().lower(), cfg.unlock_password_hash)
    return {"valid": valid}
