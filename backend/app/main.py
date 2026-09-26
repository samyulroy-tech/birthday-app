import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, SessionLocal
from app import models, auth
from app.routers import public, admin_auth, admin_config, admin_media, admin_balloons, upload

app = FastAPI(title="Birthday Surprise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(public.router)
app.include_router(admin_auth.router)
app.include_router(admin_config.router)
app.include_router(admin_media.router)
app.include_router(admin_balloons.router)
app.include_router(upload.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


def bootstrap():
    """Create tables and seed a default admin user + config on first boot."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.AdminUser).first():
            admin = models.AdminUser(
                username=settings.bootstrap_admin_username,
                password_hash=auth.hash_password(settings.bootstrap_admin_password),
            )
            db.add(admin)
            db.commit()

        if not db.query(models.SurpriseConfig).filter_by(slug="default").first():
            cfg = models.SurpriseConfig(
                slug="default",
                unlock_password_hash=auth.hash_password("cake"),
            )
            db.add(cfg)
            db.commit()
            db.refresh(cfg)

            seed_media = [
                ("That smile...", "One of my favorite memories", "2019"),
                ("Trouble, always", "Partners in crime since forever", "2020"),
                ("Golden hour", "You glowing, as usual", "2022"),
                ("Just us", "The kind of day I never want to forget", "2023"),
                ("Look how far you've come", "So proud of you", "2025"),
            ]
            for i, (title, caption, date) in enumerate(seed_media):
                db.add(
                    models.MediaItem(
                        config_id=cfg.id,
                        media_type=models.MediaType.photo,
                        url="",
                        title=title,
                        caption=caption,
                        date_label=date,
                        order_index=i,
                        duration_seconds=5,
                    )
                )

            seed_balloons = [
                "You are loved more than you know ❤️",
                "Hidden message: you are my favorite person.",
                "Almost there... 🎂",
            ]
            for i, msg in enumerate(seed_balloons):
                db.add(models.BalloonMessage(config_id=cfg.id, message=msg, enabled=True, order_index=i))

            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    bootstrap()
