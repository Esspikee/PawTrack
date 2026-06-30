import base64
import json
import logging_config
import os
import time
import urllib.error
import urllib.parse
import urllib.request

logger = logging_config.get_logger(__name__)

BASE = os.getenv("PAWTRACK_API_BASE", "http://127.0.0.1:8000").rstrip("/")
FRONTEND_ORIGIN = os.getenv("PAWTRACK_FRONTEND_ORIGIN", "http://127.0.0.1:5175").rstrip("/")
RESULTS_PATH = os.getenv("PAWTRACK_SMOKE_RESULTS", "smoke_test_results.json")

TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


class SmokeFailure(RuntimeError):
    pass


def request(method, path, *, body=None, headers=None, expected=(200,)):
    url = f"{BASE}{path}"
    data = None
    request_headers = dict(headers or {})

    if isinstance(body, dict):
        data = json.dumps(body).encode("utf-8")
        request_headers.setdefault("Content-Type", "application/json")
    elif isinstance(body, str):
        data = body.encode("utf-8")
    elif isinstance(body, bytes):
        data = body

    req = urllib.request.Request(url, data=data, headers=request_headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            raw = response.read().decode("utf-8")
            status = response.status
            response_headers = {key.lower(): value for key, value in response.headers.items()}
            try:
                parsed = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                parsed = raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8")
        status = error.code
        response_headers = {key.lower(): value for key, value in error.headers.items()}
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = raw
    except urllib.error.URLError as error:
        raise SmokeFailure(f"Could not reach PawTrack API at {BASE}: {error.reason}") from error

    result = {
        "method": method,
        "path": path,
        "status": status,
        "headers": response_headers,
        "body": parsed,
        "ok": status in expected,
    }
    if status not in expected:
        raise SmokeFailure(f"{method} {path} returned {status}; expected {expected}. Body: {parsed}")
    return result


def form_body(fields):
    return urllib.parse.urlencode(fields)


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def safe_result(result):
    sanitized = dict(result)
    body = sanitized.get("body")

    if isinstance(body, dict):
        body = dict(body)
        if "access_token" in body:
            body["access_token"] = "<redacted>"
        if sanitized.get("path") == "/openapi.json":
            body = {
                "openapi": body.get("openapi"),
                "paths": len(body.get("paths", {})),
                "schemas": len(body.get("components", {}).get("schemas", {})),
            }
    sanitized["body"] = body
    return sanitized


def multipart_file(field_name, filename, content_type, content):
    boundary = f"----pawtrack-smoke-{int(time.time() * 1000)}"
    lines = [
        f"--{boundary}\r\n".encode("utf-8"),
        (
            f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
            f"Content-Type: {content_type}\r\n\r\n"
        ).encode("utf-8"),
        content,
        f"\r\n--{boundary}--\r\n".encode("utf-8"),
    ]
    return boundary, b"".join(lines)


def main():
    logger.info("Starting PawTrack smoke tests against %s", BASE)
    logger.info("Checking CORS preflight for frontend origin %s", FRONTEND_ORIGIN)
    suffix = hex(int(time.time() * 1000))[2:]
    results = []

    user1 = {"username": f"smoke_a_{suffix}", "email": f"smoke_a_{suffix}@example.com", "password": "Password123"}
    user2 = {"username": f"smoke_b_{suffix}", "email": f"smoke_b_{suffix}@example.com", "password": "Password123"}

    try:
        results.append(request("GET", "/"))
        results.append(request("GET", "/health"))
        cors_preflight = request(
            "OPTIONS",
            "/usuarios/",
            headers={
                "Origin": FRONTEND_ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        if cors_preflight["headers"].get("access-control-allow-origin") != FRONTEND_ORIGIN:
            raise SmokeFailure(f"CORS preflight did not allow {FRONTEND_ORIGIN}")
        results.append(cors_preflight)
        results.append(request("GET", "/openapi.json"))
        results.append(request("POST", "/usuarios/", body=user1))
        results.append(request("POST", "/usuarios/", body=user2))

        login_headers = {"Content-Type": "application/x-www-form-urlencoded"}
        login1 = request("POST", "/login", body=form_body({"username": user1["email"], "password": user1["password"]}), headers=login_headers)
        login2 = request("POST", "/login", body=form_body({"username": user2["email"], "password": user2["password"]}), headers=login_headers)
        results.extend([login1, login2])

        token1 = login1["body"]["access_token"]
        token2 = login2["body"]["access_token"]

        boundary, upload_body = multipart_file("file", "smoke.png", "image/png", TINY_PNG)
        upload = request(
            "POST",
            "/upload",
            body=upload_body,
            headers={**auth(token1), "Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        results.append(upload)

        photo_url = upload["body"]["url"]
        animal_payload = {
            "nombre": "Smoke Buddy",
            "especie": "Perro",
            "color_principal": "Marron",
            "foto_principal": photo_url,
            "latitud": 4.711,
            "longitud": -74.0721,
            "descripcion": "Smoke test animal near the park",
        }
        created_animal = request("POST", "/animales/", body=animal_payload, headers=auth(token1))
        results.append(created_animal)
        animal_id = created_animal["body"]["id_animal"]

        results.append(request("GET", "/usuarios/me", headers=auth(token1)))
        results.append(request("GET", "/animales/"))
        results.append(request("GET", f"/animales/{animal_id}"))

        sighting_payload = {
            "latitud": 4.712,
            "longitud": -74.073,
            "descripcion": "Smoke test second sighting",
            "foto_url": photo_url,
        }
        sighting = request("POST", f"/animales/{animal_id}/avistamientos", body=sighting_payload, headers=auth(token2))
        results.append(sighting)
        sighting_id = sighting["body"]["id_avistamiento"]

        results.append(request("GET", f"/animales/{animal_id}/historial"))
        results.append(request("GET", f"/avistamientos/{sighting_id}/confirmaciones"))
        results.append(request("POST", f"/avistamientos/{sighting_id}/confirmar", headers=auth(token1)))
        results.append(request("GET", f"/avistamientos/{sighting_id}/confirmaciones"))
        results.append(request("DELETE", f"/avistamientos/{sighting_id}/confirmar", headers=auth(token1)))
        results.append(request("DELETE", f"/avistamientos/{sighting_id}", headers=auth(token2)))

        logger.info("Smoke tests complete: %s checks passed", len(results))
    finally:
        with open(RESULTS_PATH, "w", encoding="utf-8") as file:
            json.dump([safe_result(result) for result in results], file, indent=2, ensure_ascii=False)
            file.write("\n")
        logger.info("Smoke results written to %s", RESULTS_PATH)


if __name__ == "__main__":
    main()
