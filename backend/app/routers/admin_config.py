from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, auth, schemas

router = APIRouter(prefix="/api/admin/config", tags=["admin-config"])


@router.get("", response_model=schemas.ConfigAdminOut)
def get_config(slug: str = "default", db: Session = Depends(get_db), _=Depends(auth.get_current_admin)):
    cfg = crud.get_config(db, slug)
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")
    return cfg


@router.put("", response_model=schemas.ConfigAdminOut)
def update_config(
    payload: schemas.ConfigUpdate,
    slug: str = "default",
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    cfg = crud.get_config(db, slug)
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")

    data = payload.model_dump(exclude_unset=True)
    unlock_password = data.pop("unlock_password", None)
    for field, value in data.items():
        setattr(cfg, field, value)

    if unlock_password:
        cfg.unlock_password_hash = auth.hash_password(unlock_password.strip().lower())

    db.commit()
    db.refresh(cfg)
    return cfg
