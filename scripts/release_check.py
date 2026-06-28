import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"


def find_node():
    candidates = [
        Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe",
        Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node",
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return shutil.which("node")


def run(command, *, cwd=ROOT, env=None):
    print(f"\n> {' '.join(map(str, command))}")
    subprocess.run(command, cwd=cwd, env=env, check=True)


def main():
    node = find_node()
    if not node:
        raise SystemExit("Node.js was not found. Install Node or run from the Codex bundled runtime.")

    python = sys.executable

    run([python, "-m", "compileall", "-q", "main.py", "config.py", "database.py", "models.py", "schemas.py", "security.py", "smoke_test.py", "inspect_failure.py", "scripts/export_openapi.py"])
    run([python, "scripts/export_openapi.py"])
    run([python, "-m", "pip", "check"])

    run([node, "node_modules/vitest/vitest.mjs", "run", "--pool=threads", "--maxWorkers=1", "--no-file-parallelism"], cwd=FRONTEND)
    run([node, "node_modules/eslint/bin/eslint.js", "."], cwd=FRONTEND)
    run([node, "node_modules/vite/bin/vite.js", "build"], cwd=FRONTEND)

    api_base = os.getenv("PAWTRACK_API_BASE")
    if api_base:
        smoke_env = os.environ.copy()
        smoke_env["PAWTRACK_API_BASE"] = api_base
        run([python, "smoke_test.py"], env=smoke_env)
    else:
        print("\n> Skipping API smoke test because PAWTRACK_API_BASE is not set.")

    print("\nRelease checks completed.")


if __name__ == "__main__":
    main()
