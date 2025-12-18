import os
import json

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./google_tokens.db")

# Environment variable for persistent token storage (for platforms like Render with ephemeral storage)
# Set GOOGLE_TOKEN_JSON env var with the token JSON to persist across restarts
GOOGLE_TOKEN_ENV_VAR = "GOOGLE_TOKEN_JSON"

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
    """
    Save Google OAuth token to database.
    Also prints the token JSON so you can copy it to GOOGLE_TOKEN_JSON env var for persistence.
    """
    db = SessionLocal()
    try:
        token = db.query(GoogleToken).filter(GoogleToken.user == user).first()
        if token is None:
            token = GoogleToken(user=user, token_json=token_json)
            db.add(token)
        else:
            token.token_json = token_json
        db.commit()
        
        # Print token for manual env var setup (for platforms with ephemeral storage)
        print("\n" + "="*70)
        print("[GOOGLE TOKEN] Token saved successfully!")
        print("[GOOGLE TOKEN] To persist across server restarts on Render/Heroku,")
        print("[GOOGLE TOKEN] set the GOOGLE_TOKEN_JSON environment variable to:")
        print("="*70)
        print(token_json)
        print("="*70 + "\n")
        
    finally:
        db.close()


def load_google_token(user="default"):
    """
    Load Google OAuth token.
    Priority: 1) Environment variable (GOOGLE_TOKEN_JSON), 2) Database
    This ensures tokens persist on platforms with ephemeral storage.
    """
    # First, try loading from environment variable (highest priority for persistence)
    env_token = os.getenv(GOOGLE_TOKEN_ENV_VAR)
    if env_token:
        try:
            # Validate it's valid JSON
            json.loads(env_token)
            print("[GOOGLE TOKEN] Loaded from GOOGLE_TOKEN_JSON environment variable")
            return env_token
        except json.JSONDecodeError:
            print("[GOOGLE TOKEN] GOOGLE_TOKEN_JSON env var contains invalid JSON, falling back to database")
    
    # Fall back to database
    db = SessionLocal()
    try:
        token = db.query(GoogleToken).filter(GoogleToken.user == user).first()
        if token:
            print("[GOOGLE TOKEN] Loaded from database")
            return token.token_json
        return None
    finally:
        db.close()
