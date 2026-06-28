import json
from database import SessionLocal
import models
import os
import time
import urllib.error
import urllib.request
import logging_config

logger = logging_config.get_logger(__name__)

BASE = os.getenv("PAWTRACK_API_BASE", "http://127.0.0.1:8000").rstrip("/")
payload = {'username':'traceuser','email':'traceuser@example.com','password':'Password123'}

logger.info('Sending POST /usuarios/ to %s...', BASE)
request = urllib.request.Request(
    f"{BASE}/usuarios/",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(request, timeout=20) as response:
        body = response.read().decode("utf-8")
        logger.info('Response status: %s', response.status)
        logger.info('Response body: %s', json.loads(body) if body else None)
except urllib.error.HTTPError as error:
    body = error.read().decode("utf-8")
    logger.info('Response status: %s', error.code)
    logger.warning('Response body: %s', body)

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
