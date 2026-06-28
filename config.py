"""
Centralized configuration module for PawTrack Backend.

All configuration is loaded from environment variables.
No hardcoded secrets should exist in the codebase.
"""

import os
from dotenv import load_dotenv

# Load .env file from the same directory as this config module
load_dotenv()

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not configured. "
        "Please set DATABASE_URL to your PostgreSQL connection string. "
        "Example: postgresql://user:password@localhost/dbname"
    )

# ==========================================
# JWT SECURITY CONFIGURATION
# ==========================================
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not configured. "
        "Please set SECRET_KEY to a secure random string. "
        "Example: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
    )

# JWT Algorithm (can be overridden if needed, defaults to HS256)
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Token expiration time in minutes
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ==========================================
# ENVIRONMENT
# ==========================================
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


# Browser origins allowed to call the API. Keep this explicit in production.
DEFAULT_DEV_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
CORS_ALLOWED_ORIGINS = _parse_csv(os.getenv("CORS_ALLOWED_ORIGINS")) or (
    DEFAULT_DEV_CORS_ORIGINS if DEBUG else []
)
CORS_ALLOW_ORIGIN_REGEX = os.getenv("CORS_ALLOW_ORIGIN_REGEX") or None

if ENVIRONMENT == "production" and not CORS_ALLOWED_ORIGINS and not CORS_ALLOW_ORIGIN_REGEX:
    raise RuntimeError(
        "CORS_ALLOWED_ORIGINS must be configured in production. "
        "Set it to the deployed frontend URL, for example: "
        "https://your-pawtrack-app.netlify.app"
    )

if ENVIRONMENT == "production":
    if not DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg2://")):
        raise RuntimeError("Production DATABASE_URL must point to PostgreSQL.")
    if len(SECRET_KEY) < 32 or "your_" in SECRET_KEY or "replace" in SECRET_KEY.lower():
        raise RuntimeError("Production SECRET_KEY must be a real random secret with at least 32 characters.")
    placeholder_origins = [origin for origin in CORS_ALLOWED_ORIGINS if "example.com" in origin or "your-" in origin]
    if placeholder_origins:
        raise RuntimeError("Replace placeholder CORS_ALLOWED_ORIGINS before production deploy.")

# Rate limiting. Enabled by default; set RATE_LIMIT_ENABLED=false to turn it off
# (useful for local development and automated tests).
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").strip().lower() not in ("false", "0", "no")

# Optional version metadata for startup logging
APP_VERSION = os.getenv("APP_VERSION", "unknown")

# Local uploads directory. In production, point this to a persistent disk path
# if the host filesystem is ephemeral.
UPLOADS_DIR = os.getenv("UPLOADS_DIR")
