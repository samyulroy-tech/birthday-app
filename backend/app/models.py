import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    Text,
    Enum,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ---------- Enums ----------

class MediaType(str, enum.Enum):
    photo = "photo"
    video = "video"


# ---------- Admin User ----------

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(
        UUID(as_uuid=False),
        primary_key=True,
        default=gen_uuid,
    )

    username = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ---------- Surprise Config ----------

class SurpriseConfig(Base):
    __tablename__ = "surprise_config"

    id = Column(
        UUID(as_uuid=False),
        primary_key=True,
        default=gen_uuid,
    )

    slug = Column(
        String(64),
        unique=True,
        nullable=False,
        default="default",
    )

    recipient_name = Column(
        String(120),
        nullable=False,
        default="Sis",
    )

    birthday_date = Column(
        String(10),
        nullable=False,
        default="2026-10-01",
    )

    birthday_time = Column(
        String(5),
        nullable=False,
        default="00:00",
    )

    timezone = Column(
        String(64),
        nullable=False,
        default="Asia/Kathmandu",
    )

    unlock_password_hash = Column(
        String(255),
        nullable=False,
    )

    intro_message = Column(
        Text,
        default=(
            "I made something special for you.\n"
            "But first, you need to unlock it. ❤️"
        ),
    )

    birthday_message = Column(
        Text,
        default="Another year of you making the world brighter.",
    )

    cake_message = Column(
        String(255),
        default="Happy Birthday",
    )

    gift_message = Column(
        String(255),
        default="Wait... there's still one more surprise.",
    )

    final_message = Column(
        Text,
        default=(
            "Thank you for every laugh, every fight we survived,\n"
            "and every time you had my back."
        ),
    )

    finale_subtitle = Column(
        String(255),
        default="Made with love, just for you.",
    )

    music_url = Column(
        String(500),
        nullable=True,
    )

    photo_duration_seconds = Column(
        Integer,
        default=5,
    )

    special_media_id = Column(
        UUID(as_uuid=False),
        ForeignKey(
            "media_items.id",
            use_alter=True,
            name="fk_special_media",
        ),
        nullable=True,
    )

    theme = Column(
        String(32),
        default="midnight-rose",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # ---------- Relationships ----------

    media_items = relationship(
        "MediaItem",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="MediaItem.order_index",
        foreign_keys="MediaItem.config_id",
    )

    balloons = relationship(
        "BalloonMessage",
        back_populates="config",
        cascade="all, delete-orphan",
        order_by="BalloonMessage.order_index",
    )


# ---------- Media ----------

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(
        UUID(as_uuid=False),
        primary_key=True,
        default=gen_uuid,
    )

    config_id = Column(
        UUID(as_uuid=False),
        ForeignKey("surprise_config.id"),
        nullable=False,
    )

    media_type = Column(
        Enum(MediaType),
        nullable=False,
        default=MediaType.photo,
    )

    url = Column(
        String(500),
        nullable=False,
    )

    thumbnail_url = Column(
        String(500),
        nullable=True,
    )

    title = Column(
        String(200),
        default="",
    )

    caption = Column(
        Text,
        default="",
    )

    date_label = Column(
        String(50),
        default="",
    )

    order_index = Column(
        Integer,
        default=0,
    )

    duration_seconds = Column(
        Integer,
        default=5,
    )

    include_in_finale = Column(
        Boolean,
        default=True,
    )

    include_in_gallery = Column(
        Boolean,
        default=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    config = relationship(
        "SurpriseConfig",
        back_populates="media_items",
        foreign_keys=[config_id],
    )


# ---------- Balloons ----------

class BalloonMessage(Base):
    __tablename__ = "balloon_messages"

    id = Column(
        UUID(as_uuid=False),
        primary_key=True,
        default=gen_uuid,
    )

    config_id = Column(
        UUID(as_uuid=False),
        ForeignKey("surprise_config.id"),
        nullable=False,
    )

    message = Column(
        String(300),
        nullable=False,
    )

    enabled = Column(
        Boolean,
        default=True,
    )

    order_index = Column(
        Integer,
        default=0,
    )

    config = relationship(
        "SurpriseConfig",
        back_populates="balloons",
    )