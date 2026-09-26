from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, auth, schemas, models

router = APIRouter(prefix="/api/admin/balloons", tags=["admin-balloons"])


@router.get("", response_model=list[schemas.BalloonOut])
def list_balloons(slug: str = "default", db: Session = Depends(get_db), _=Depends(auth.get_current_admin)):
    cfg = crud.get_config(db, slug)
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")
    return cfg.balloons


@router.post("", response_model=schemas.BalloonOut)
def create_balloon(
    payload: schemas.BalloonCreate,
    slug: str = "default",
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    cfg = crud.get_config(db, slug)
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")
    max_order = max([b.order_index for b in cfg.balloons], default=-1)
    item = models.BalloonMessage(config_id=cfg.id, order_index=max_order + 1, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{balloon_id}", response_model=schemas.BalloonOut)
def update_balloon(
    balloon_id: str,
    payload: schemas.BalloonUpdate,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    item = db.query(models.BalloonMessage).filter(models.BalloonMessage.id == balloon_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Balloon message not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{balloon_id}")
def delete_balloon(balloon_id: str, db: Session = Depends(get_db), _=Depends(auth.get_current_admin)):
    item = db.query(models.BalloonMessage).filter(models.BalloonMessage.id == balloon_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Balloon message not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
