import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from PIL import Image

from app.config import settings
from app import auth

router = APIRouter(prefix="/api/admin/upload", tags=["admin-upload"])

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}
MAX_BYTES = settings.max_upload_mb * 1024 * 1024


def _ensure_dirs():
    os.makedirs(os.path.join(settings.upload_dir, "photos"), exist_ok=True)
    os.makedirs(os.path.join(settings.upload_dir, "videos"), exist_ok=True)
    os.makedirs(os.path.join(settings.upload_dir, "thumbnails"), exist_ok=True)


@router.post("")
async def upload_media(file: UploadFile = File(...), _=Depends(auth.get_current_admin)):
    _ensure_dirs()
    ext = os.path.splitext(file.filename or "")[1].lower()

    if ext in IMAGE_EXTS:
        media_type = "photo"
        subdir = "photos"
    elif ext in VIDEO_EXTS:
        media_type = "video"
        subdir = "videos"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext or 'unknown'}")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.upload_dir, subdir, filename)
    with open(path, "wb") as f:
        f.write(contents)

    thumbnail_url = None
    if media_type == "photo":
        try:
            thumb_name = f"thumb_{filename}"
            thumb_path = os.path.join(settings.upload_dir, "thumbnails", thumb_name)
            with Image.open(path) as im:
                im = im.convert("RGB")
                im.thumbnail((480, 480))
                im.save(thumb_path, "JPEG", quality=80)
            thumbnail_url = f"/uploads/thumbnails/{thumb_name}"
        except Exception:
            thumbnail_url = None

    return {
        "url": f"/uploads/{subdir}/{filename}",
        "thumbnail_url": thumbnail_url,
        "filename": filename,
        "media_type": media_type,
    }
