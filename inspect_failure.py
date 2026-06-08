import requests
from database import SessionLocal
import models
import time
import logging_config

logger = logging_config.get_logger(__name__)

BASE = "http://127.0.0.1:8001"
payload = {'username':'traceuser','email':'traceuser@example.com','password':'Password123'}

logger.info('Sending POST /usuarios...')
r = requests.post(f"{BASE}/usuarios", json=payload)
logger.info('Response status: %s', r.status_code)
try:
    logger.info('Response body: %s', r.json())
except Exception:
    logger.warning('Response text: %s', r.text)

# Wait a moment for server logs to flush
time.sleep(0.5)

# Query DB for the most recent user with that email
db = SessionLocal()
try:
    user = db.query(models.Usuario).filter(models.Usuario.email==payload['email']).first()
    logger.info('Queried DB user object')
    logger.info('type: %s', type(user))
    if user:
        # Print attribute dict of the SQLAlchemy object
        attrs = {c.name: getattr(user, c.name) for c in user.__table__.columns}
        logger.info('attributes: %s', attrs)
    else:
        logger.info('No user found in DB with that email')
finally:
    db.close()
