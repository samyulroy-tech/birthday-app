from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, auth, schemas

router = APIRouter(prefix="/api/admin", tags=["admin-auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.AdminUser).filter(models.AdminUser.username == payload.username).first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = auth.create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def me(current=Depends(auth.get_current_admin)):
    return {"username": current.username, "id": current.id}
