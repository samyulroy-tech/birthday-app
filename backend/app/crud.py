from sqlalchemy.orm import Session, joinedload

from app import models


def get_config(db: Session, slug: str = "default") -> models.SurpriseConfig | None:
    return (
        db.query(models.SurpriseConfig)
        .options(joinedload(models.SurpriseConfig.media_items), joinedload(models.SurpriseConfig.balloons))
        .filter(models.SurpriseConfig.slug == slug)
        .first()
    )


def get_or_create_default_config(db: Session, unlock_password_hash: str) -> models.SurpriseConfig:
    cfg = get_config(db, "default")
    if cfg:
        return cfg
    cfg = models.SurpriseConfig(slug="default", unlock_password_hash=unlock_password_hash)
    db.add(cfg)
    db.commit()
    db.refresh(cfg)
    return cfg
