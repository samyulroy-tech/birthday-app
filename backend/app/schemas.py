
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import MediaType


# ---------- Auth ----------

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class VerifyPasswordRequest(BaseModel):
    password: str


class VerifyPasswordResponse(BaseModel):
    valid: bool


# ---------- Media ----------

class MediaItemBase(BaseModel):
    media_type: MediaType
    url: str
    thumbnail_url: Optional[str] = None
    title: str = ""
    caption: str = ""
    date_label: str = ""
    order_index: int = 0
    duration_seconds: int = 5
    include_in_finale: bool = True
    include_in_gallery: bool = True


class MediaItemCreate(MediaItemBase):
    pass


class MediaItemUpdate(BaseModel):
    media_type: Optional[MediaType] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    date_label: Optional[str] = None
    order_index: Optional[int] = None
    duration_seconds: Optional[int] = None
    include_in_finale: Optional[bool] = None
    include_in_gallery: Optional[bool] = None


class MediaItemOut(MediaItemBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class ReorderRequest(BaseModel):
    ordered_ids: list[str]


# ---------- Balloons ----------

class BalloonBase(BaseModel):
    message: str
    enabled: bool = True
    order_index: int = 0


# Create request
# order_index is intentionally NOT included because
# the backend calculates it automatically.
class BalloonCreate(BaseModel):
    message: str
    enabled: bool = True


class BalloonUpdate(BaseModel):
    message: Optional[str] = None
    enabled: Optional[bool] = None
    order_index: Optional[int] = None


class BalloonOut(BalloonBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


# ---------- Config ----------

class ConfigPublicOut(BaseModel):
    """
    Public-facing configuration.

    Does not expose the unlock password hash.
    """

    recipient_name: str
    birthday_date: str
    birthday_time: str
    timezone: str

    intro_message: str
    birthday_message: str
    cake_message: str
    gift_message: str
    final_message: str
    finale_subtitle: str

    music_url: Optional[str] = None
    photo_duration_seconds: int
    special_media_id: Optional[str] = None
    theme: str

    media_items: list[MediaItemOut]
    balloons: list[BalloonOut]

    model_config = ConfigDict(from_attributes=True)


class ConfigUpdate(BaseModel):
    recipient_name: Optional[str] = None
    birthday_date: Optional[str] = None
    birthday_time: Optional[str] = None
    timezone: Optional[str] = None

    # Plaintext password is accepted here.
    # It MUST be hashed before being stored in the database.
    unlock_password: Optional[str] = None

    intro_message: Optional[str] = None
    birthday_message: Optional[str] = None
    cake_message: Optional[str] = None
    gift_message: Optional[str] = None
    final_message: Optional[str] = None
    finale_subtitle: Optional[str] = None

    music_url: Optional[str] = None
    photo_duration_seconds: Optional[int] = None
    special_media_id: Optional[str] = None
    theme: Optional[str] = None


class ConfigAdminOut(BaseModel):
    id: str
    slug: str

    recipient_name: str
    birthday_date: str
    birthday_time: str
    timezone: str

    intro_message: str
    birthday_message: str
    cake_message: str
    gift_message: str
    final_message: str
    finale_subtitle: str

    music_url: Optional[str] = None
    photo_duration_seconds: int
    special_media_id: Optional[str] = None
    theme: str

    updated_at: datetime

    media_items: list[MediaItemOut]
    balloons: list[BalloonOut]

    model_config = ConfigDict(from_attributes=True)


# ---------- Upload ----------

class UploadResponse(BaseModel):
    url: str
    filename: str
    media_type: MediaType