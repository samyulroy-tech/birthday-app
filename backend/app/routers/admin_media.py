import os
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, auth, schemas, models
from app.config import settings


router = APIRouter(
    prefix="/api/admin/media",
    tags=["admin-media"],
)


# ============================================================
# FILE HELPERS
# ============================================================

def _delete_file_from_url(url: str | None) -> None:
    """
    Delete a locally stored uploaded file from its /uploads/... URL.

    Example:
        /uploads/photos/abc.jpg
        /uploads/videos/abc.mp4
        /uploads/thumbnails/thumb_abc.jpg
    """

    if not url:
        return

    try:
        parsed = urlparse(url)
        path = parsed.path

        prefix = "/uploads/"

        if not path.startswith(prefix):
            return

        relative_path = path[len(prefix):]

        if not relative_path:
            return

        # Normalize path to prevent accidental traversal.
        relative_path = os.path.normpath(relative_path)

        # Never allow paths like ../../something
        if relative_path.startswith(".."):
            return

        full_path = os.path.abspath(
            os.path.join(
                settings.upload_dir,
                relative_path,
            )
        )

        upload_root = os.path.abspath(
            settings.upload_dir
        )

        # Make absolutely sure the file is inside upload_dir.
        if os.path.commonpath(
            [full_path, upload_root]
        ) != upload_root:
            return

        if os.path.isfile(full_path):
            os.remove(full_path)

    except Exception:
        # File cleanup should never break the API.
        # Database operation remains the source of truth.
        pass


def _delete_media_files(item: models.MediaItem) -> None:
    """
    Delete the physical media file and thumbnail associated
    with a MediaItem.
    """

    _delete_file_from_url(
        getattr(item, "url", None)
    )

    _delete_file_from_url(
        getattr(item, "thumbnail_url", None)
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

    # MediaItemCreate may contain order_index,
    # but the server controls ordering.
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

    # --------------------------------------------------------
    # Remember old file URLs.
    #
    # We only delete these AFTER the database update
    # succeeds.
    # --------------------------------------------------------

    old_url = item.url
    old_thumbnail_url = item.thumbnail_url

    # Check whether the media file itself is being replaced.
    replacing_media = (
        "url" in update_data
        and update_data["url"] != old_url
    )

    replacing_thumbnail = (
        "thumbnail_url" in update_data
        and update_data["thumbnail_url"] != old_thumbnail_url
    )

    # --------------------------------------------------------
    # Apply database changes.
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Database update succeeded.
    #
    # Now it is safe to remove the old physical files.
    # --------------------------------------------------------

    if replacing_media:
        _delete_file_from_url(old_url)

    if replacing_thumbnail:
        _delete_file_from_url(old_thumbnail_url)

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
    # Save URLs BEFORE deleting the database record.
    # --------------------------------------------------------

    media_url = item.url
    thumbnail_url = item.thumbnail_url

    # --------------------------------------------------------
    # SurpriseConfig.special_media_id may point to this media.
    #
    # Clear the reference first so PostgreSQL does not reject
    # the DELETE because of the foreign key.
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

    # --------------------------------------------------------
    # Delete database record.
    # --------------------------------------------------------

    db.delete(item)

    try:
        db.commit()

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete media item",
        )

    # --------------------------------------------------------
    # Database delete succeeded.
    #
    # Now remove the physical files.
    # --------------------------------------------------------

    _delete_file_from_url(media_url)
    _delete_file_from_url(thumbnail_url)

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