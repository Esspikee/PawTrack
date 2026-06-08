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

# Optional version metadata for startup logging
APP_VERSION = os.getenv("APP_VERSION", "unknown")
