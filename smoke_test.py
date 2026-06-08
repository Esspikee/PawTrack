import requests
import sys
import logging_config

logger = logging_config.get_logger(__name__)

BASE = "http://127.0.0.1:8001"

def pretty(resp):
    try:
        return resp.status_code, resp.json()
    except Exception:
        return resp.status_code, resp.text

logger.info('Starting smoke tests...')

# 1. Create user1
u1 = {'username':'tester1','email':'tester1@example.com','password':'Password123'}
r = requests.post(f"{BASE}/usuarios", json=u1)
logger.info('/usuarios POST -> %s', pretty(r))

# 2. Login user1
r = requests.post(f"{BASE}/login", data={'username':u1['email'],'password':u1['password']})
logger.info('/login POST -> %s', pretty(r))
if r.status_code==200:
    token1 = r.json().get('access_token')
else:
    token1 = None

# 3. Get usuarios
r = requests.get(f"{BASE}/usuarios/")
logger.info('/usuarios GET -> %s', pretty(r))

# 4. Get animales
r = requests.get(f"{BASE}/animales/")
logger.info('/animales GET -> %s', pretty(r))

# 5. Create animal with user1 (if have token)
if token1:
    headers = {'Authorization': f'Bearer {token1}'}
    animal_payload = {
        'especie':'Perro',
        'color_principal':'Marron',
        'foto_principal':None,
        'latitud':-34.0,
        'longitud':-58.0,
        'descripcion':'Perro encontrado cerca del parque'
    }
    r = requests.post(f"{BASE}/animales/", json=animal_payload, headers=headers)
    logger.info('/animales POST -> %s', pretty(r))
    animal_id = None
    first_av = None
    if r.status_code==200 or r.status_code==201:
        data = r.json()
        animal_id = data.get('id_animal')
        avs = data.get('avistamientos')
        if avs and len(avs)>0:
            first_av = avs[0].get('id_avistamiento')
else:
    logger.warning('Skipping animal creation due to missing token')

# 6. Create user2 and login
u2 = {'username':'tester2','email':'tester2@example.com','password':'Password123'}
r = requests.post(f"{BASE}/usuarios", json=u2)
logger.info('user2 /usuarios POST -> %s', pretty(r))
r = requests.post(f"{BASE}/login", data={'username':u2['email'],'password':u2['password']})
logger.info('user2 /login POST -> %s', pretty(r))
if r.status_code==200:
    token2 = r.json().get('access_token')
else:
    token2 = None

# 7. User2 adds avistamiento to animal
if token2 and animal_id:
    headers2 = {'Authorization': f'Bearer {token2}'}
    av_payload = {
        'latitud':-34.0001,
        'longitud':-58.0001,
        'descripcion':'Visto de nuevo cerca de la plaza',
        'foto_url':None
    }
    r = requests.post(f"{BASE}/animales/{animal_id}/avistamientos", json=av_payload, headers=headers2)
    logger.info('/animales/%s/avistamientos POST -> %s', animal_id, pretty(r))
    if r.status_code==200 or r.status_code==201:
        av_created = r.json().get('id_avistamiento')
else:
    logger.warning('Skipping avistamiento creation')

# 8. User2 confirms first avistamiento (owned by user1)
if token2 and first_av:
    r = requests.post(f"{BASE}/avistamientos/{first_av}/confirmar", headers=headers2)
    logger.info('/avistamientos/%s/confirmar POST -> %s', first_av, pretty(r))
    # 9. Delete confirmation
    r = requests.delete(f"{BASE}/avistamientos/{first_av}/confirmar", headers=headers2)
    logger.info('/avistamientos/%s/confirmar DELETE -> %s', first_av, pretty(r))
else:
    logger.warning('Skipping confirmation tests')

logger.info('Smoke tests complete')
