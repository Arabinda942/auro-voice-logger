from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
import models, os

SECRET_KEY = os.getenv('SECRET_KEY', 'arabindasarkar199819981988')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12

def hash_password(password: str) -> str:
    pw = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    pw = plain.encode('utf-8')[:72]
    return bcrypt.checkpw(pw, hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get('sub'))
        return db.query(models.User).filter(models.User.id == user_id).first()
    except Exception:
        return None

def authenticate_user(db: Session, login_id: str, password: str):
    user = db.query(models.User).filter(models.User.login_id == login_id).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    user.last_login = datetime.utcnow()
    db.commit()
    return user" -Encoding utf8
