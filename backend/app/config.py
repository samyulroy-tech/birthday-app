import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://birthday:birthday@localhost:5432/birthday_surprise",
    )
    jwt_secret: str = os.getenv("JWT_SECRET", "change-this-secret-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 12  # 12 hours
    upload_dir: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "80"))
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    # Bootstrap admin, only used the first time the DB has no admin user
    bootstrap_admin_username: str = os.getenv("BOOTSTRAP_ADMIN_USERNAME", "admin")
    bootstrap_admin_password: str = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "changeme123")

    class Config:
        env_file = ".env"


settings = Settings()
