import requests
import sys

BASE = "http://127.0.0.1:8001"

def pretty(resp):
    try:
        return resp.status_code, resp.json()
    except Exception:
        return resp.status_code, resp.text

print('Starting smoke tests...')

# 1. Create user1
u1 = {'username':'tester1','email':'tester1@example.com','password':'Password123'}
r = requests.post(f"{BASE}/usuarios", json=u1)
print('/usuarios POST ->', pretty(r))

# 2. Login user1
r = requests.post(f"{BASE}/login", data={'username':u1['email'],'password':u1['password']})
print('/login POST ->', pretty(r))
if r.status_code==200:
    token1 = r.json().get('access_token')
else:
    token1 = None

# 3. Get usuarios
r = requests.get(f"{BASE}/usuarios/")
print('/usuarios GET ->', pretty(r))

# 4. Get animales
r = requests.get(f"{BASE}/animales/")
print('/animales GET ->', pretty(r))

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
    print('/animales POST ->', pretty(r))
    animal_id = None
    first_av = None
    if r.status_code==200 or r.status_code==201:
        data = r.json()
        animal_id = data.get('id_animal')
        avs = data.get('avistamientos')
        if avs and len(avs)>0:
            first_av = avs[0].get('id_avistamiento')
else:
    print('Skipping animal creation due to missing token')

# 6. Create user2 and login
u2 = {'username':'tester2','email':'tester2@example.com','password':'Password123'}
r = requests.post(f"{BASE}/usuarios", json=u2)
print('user2 /usuarios POST ->', pretty(r))
r = requests.post(f"{BASE}/login", data={'username':u2['email'],'password':u2['password']})
print('user2 /login POST ->', pretty(r))
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
    print(f'/animales/{animal_id}/avistamientos POST ->', pretty(r))
    if r.status_code==200 or r.status_code==201:
        av_created = r.json().get('id_avistamiento')
else:
    print('Skipping avistamiento creation')

# 8. User2 confirms first avistamiento (owned by user1)
if token2 and first_av:
    r = requests.post(f"{BASE}/avistamientos/{first_av}/confirmar", headers=headers2)
    print(f'/avistamientos/{first_av}/confirmar POST ->', pretty(r))
    # 9. Delete confirmation
    r = requests.delete(f"{BASE}/avistamientos/{first_av}/confirmar", headers=headers2)
    print(f'/avistamientos/{first_av}/confirmar DELETE ->', pretty(r))
else:
    print('Skipping confirmation tests')

print('Smoke tests complete')
