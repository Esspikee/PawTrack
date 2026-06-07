import requests
from database import SessionLocal
import models
import time

BASE = "http://127.0.0.1:8001"
payload = {'username':'traceuser','email':'traceuser@example.com','password':'Password123'}

print('Sending POST /usuarios...')
r = requests.post(f"{BASE}/usuarios", json=payload)
print('Response status:', r.status_code)
try:
    print('Response body:', r.json())
except Exception as e:
    print('Response text:', r.text)

# Wait a moment for server logs to flush
time.sleep(0.5)

# Query DB for the most recent user with that email
db = SessionLocal()
try:
    user = db.query(models.Usuario).filter(models.Usuario.email==payload['email']).first()
    print('\nQueried DB user object:')
    print('type:', type(user))
    if user:
        # Print attribute dict of the SQLAlchemy object
        attrs = {c.name: getattr(user, c.name) for c in user.__table__.columns}
        print('attributes:', attrs)
    else:
        print('No user found in DB with that email')
finally:
    db.close()
