import argparse
import json
import urllib.error
import urllib.request


def normalize_url(value: str) -> str:
    return value.rstrip("/")


def request(url: str, *, method: str = "GET", headers: dict[str, str] | None = None):
    req = urllib.request.Request(url, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, {key.lower(): value for key, value in response.headers.items()}, body
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, {key.lower(): value for key, value in error.headers.items()}, body
    except urllib.error.URLError as error:
        raise SystemExit(f"Could not reach {url}: {error.reason}") from error


def assert_ok(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)
    print(f"OK: {message}")


def main():
    parser = argparse.ArgumentParser(description="Verify deployed PawTrack frontend/backend basics.")
    parser.add_argument("--api-base", required=True, help="Deployed backend base URL, for example https://pawtrack-api.onrender.com")
    parser.add_argument("--frontend-origin", required=True, help="Deployed frontend origin, for example https://pawtrack.netlify.app")
    args = parser.parse_args()

    api_base = normalize_url(args.api_base)
    frontend_origin = normalize_url(args.frontend_origin)

    status, headers, body = request(f"{api_base}/health")
    assert_ok(status == 200, f"backend /health responded with HTTP 200 (got {status})")
    try:
        health = json.loads(body)
    except json.JSONDecodeError as error:
        raise SystemExit(f"backend /health did not return JSON: {body[:120]}") from error
    assert_ok(health.get("status") == "ok", "backend /health returned status=ok")

    status, headers, _ = request(
        f"{api_base}/usuarios/",
        method="OPTIONS",
        headers={
            "Origin": frontend_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert_ok(status == 200, f"CORS preflight responded with HTTP 200 (got {status})")
    assert_ok(
        headers.get("access-control-allow-origin") == frontend_origin,
        f"CORS allows frontend origin {frontend_origin}",
    )

    status, _, body = request(frontend_origin)
    assert_ok(status == 200, f"frontend responded with HTTP 200 (got {status})")
    assert_ok("PawTrack" in body, "frontend HTML contains PawTrack")

    print("Deployed readiness checks completed.")


if __name__ == "__main__":
    main()
