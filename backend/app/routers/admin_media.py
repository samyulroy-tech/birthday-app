from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, auth, schemas, models


router = APIRouter(
    prefix="/api/admin/media",
    tags=["admin-media"],
)


# ============================================================
# LIST MEDIA
# ============================================================

@router.get(
    "",
    response_model=list[schemas.MediaItemOut],
)
def list_media(
    slug: str = "default",
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    cfg = crud.get_config(db, slug)

    if not cfg:
        raise HTTPException(
            status_code=404,
            detail="Config not found",
        )

    return cfg.media_items


# ============================================================
# CREATE MEDIA
# ============================================================

@router.post(
    "",
    response_model=schemas.MediaItemOut,
)
def create_media(
    payload: schemas.MediaItemCreate,
    slug: str = "default",
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    cfg = crud.get_config(db, slug)

    if not cfg:
        raise HTTPException(
            status_code=404,
            detail="Config not found",
        )

    # Find the next order index automatically.
    max_order = max(
        [m.order_index for m in cfg.media_items],
        default=-1,
    )

    next_order = max_order + 1

    # Convert Pydantic model to dict.
    data = payload.model_dump()

    # IMPORTANT:
    # MediaItemCreate contains order_index, but we generate
    # the order index on the server. Remove it so that
    # MediaItem() does not receive order_index twice.
    data.pop("order_index", None)

    item = models.MediaItem(
        config_id=cfg.id,
        order_index=next_order,
        **data,
    )

    try:
        db.add(item)
        db.commit()
        db.refresh(item)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create media item",
        )

    return item


# ============================================================
# UPDATE MEDIA
# ============================================================

@router.put(
    "/{media_id}",
    response_model=schemas.MediaItemOut,
)
def update_media(
    media_id: str,
    payload: schemas.MediaItemUpdate,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    item = (
        db.query(models.MediaItem)
        .filter(models.MediaItem.id == media_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Media item not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(item, field, value)

    try:
        db.commit()
        db.refresh(item)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update media item",
        )

    return item


# ============================================================
# DELETE MEDIA
# ============================================================

@router.delete(
    "/{media_id}",
)
def delete_media(
    media_id: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    item = (
        db.query(models.MediaItem)
        .filter(models.MediaItem.id == media_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Media item not found",
        )

    # --------------------------------------------------------
    # IMPORTANT:
    # SurpriseConfig.special_media_id points to this media.
    #
    # PostgreSQL will reject deleting the media while that
    # foreign-key reference exists.
    #
    # Clear the reference first.
    # --------------------------------------------------------

    configs_using_media = (
        db.query(models.SurpriseConfig)
        .filter(
            models.SurpriseConfig.special_media_id
            == media_id
        )
        .all()
    )

    for cfg in configs_using_media:
        cfg.special_media_id = None

    # Now the media item can safely be deleted.
    db.delete(item)

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete media item",
        )

    return {
        "ok": True,
        "deleted_id": media_id,
    }


# ============================================================
# REORDER MEDIA
# ============================================================

@router.post(
    "/reorder",
)
def reorder_media(
    payload: schemas.ReorderRequest,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_admin),
):
    try:
        for index, media_id in enumerate(
            payload.ordered_ids
        ):
            (
                db.query(models.MediaItem)
                .filter(
                    models.MediaItem.id
                    == media_id
                )
                .update(
                    {
                        "order_index": index
                    }
                )
            )

        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to reorder media",
        )

    return {
        "ok": True
    }