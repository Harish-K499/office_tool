import os

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./google_tokens.db")

_connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class GoogleToken(Base):
    __tablename__ = "google_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(128), nullable=False, unique=True)
    token_json = Column(Text, nullable=False)


Base.metadata.create_all(bind=engine)


def save_google_token(token_json, user="default"):
    db = SessionLocal()
    try:
        token = db.query(GoogleToken).filter(GoogleToken.user == user).first()
        if token is None:
            token = GoogleToken(user=user, token_json=token_json)
            db.add(token)
        else:
            token.token_json = token_json
        db.commit()
    finally:
        db.close()


def load_google_token(user="default"):
    db = SessionLocal()
    try:
        token = db.query(GoogleToken).filter(GoogleToken.user == user).first()
        return token.token_json if token else None
    finally:
        db.close()
