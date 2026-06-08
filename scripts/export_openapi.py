"""
Export the live OpenAPI spec (the API contract) to openapi.json at the repo root.

Run it whenever you change an endpoint or a schema, then commit the updated
openapi.json alongside your code change so the contract in git always matches
the code in git.

Usage (from anywhere, with the virtualenv active):
    python scripts/export_openapi.py

Or without activating the venv:
    .venv/bin/python scripts/export_openapi.py

Note: this imports the app, so a valid .env must exist (it reads DATABASE_URL /
SECRET_KEY), but it does NOT need PostgreSQL to be running.
"""
import json
import sys
from pathlib import Path

# Make the project root importable no matter where this script is run from,
# so "import main" resolves to ../main.py.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import main  # noqa: E402  (import after sys.path tweak, by design)

OUTPUT = ROOT / "openapi.json"


def export() -> None:
    spec = main.app.openapi()
    with OUTPUT.open("w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"OpenAPI {spec.get('openapi')} written to {OUTPUT}")
    print(f"  paths:   {len(spec.get('paths', {}))}")
    print(f"  schemas: {len(spec.get('components', {}).get('schemas', {}))}")


if __name__ == "__main__":
    export()
