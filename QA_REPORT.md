# PawTrack testing handoff — October 4, 2026

## Sighting deletion update

- Added Profile → Mis avistamientos and a visible delete button in animal history.
- Authenticated authors can delete only their own sightings. API tests cover
  signed-out requests and attempts by other users, including the animal discoverer.
- Last-sighting deletion now removes the empty animal pin after confirmation.
  This intentionally supersedes the earlier last-sighting protection listed below.
- 70 frontend tests and 12 backend tests passed; lint and production build passed.
- Mocked Chrome checks passed at 320, 390, and 768 px: profile navigation,
  cancellation, rejection, successful deletion, empty state, and no overflow.
- Local server restarted and health verified. No real sightings were deleted.
- Public tunnel status was not verified for this update; the URL below is historical.

## Earlier testing snapshot

Public testing URL: https://wing-holmes-victory-plus.trycloudflare.com

The production frontend and FastAPI API are running together on port 8000,
using the existing PostgreSQL database in Ubuntu/WSL. A Windows Cloudflare
Quick Tunnel forwards HTTPS traffic to this server. This is a temporary testing
deployment: the PC, WSL server, PostgreSQL, and tunnel must remain running.
Restarting the tunnel creates a different URL. See `RUN_ON_MY_PC.md` for restart
commands. Logs, process IDs, screenshots, and smoke results are in ignored `.local/`.

## Verified

- 39 frontend tests and 7 backend unit tests passed.
- ESLint, Python compilation, production Vite build, and `git diff --check` passed.
- Python `pip check` found no broken requirements.
- `npm audit` reported zero vulnerabilities after compatible dependency updates.
- 20 PostgreSQL-backed API smoke checks passed: registration, login, upload,
  profiles, animal creation/update/detail/history, sightings, confirmations,
  unconfirmation, and deletion.
- 12 additional API regression checks passed: authentication, oversized login
  passwords, malformed UUIDs, coordinate validation, ownership checks, protection
  of the last sighting, self-confirmation rejection, fake image rejection, and
  exclusion of email/password from public user profiles.
- Headless Chrome exercised the public HTTPS URL: UI registration/login, simulated
  GPS, photo upload/display, animal creation, sighting creation/deletion, map,
  profile, codex, bestiary, achievements, activity, and settings.
- Mobile pages at 390 px had no horizontal overflow; no browser exceptions or
  HTTP 5xx responses occurred in the exercised public flows.
- Public deployment readiness passed. The final rebuilt bundle was checked again
  through the tunnel after dependency updates.
- The three QA accounts and their generated animals/photos were removed. Existing
  user records were preserved.

## Fixes made

- Restored geolocation state after React StrictMode replays effects.
- Prevented empty coordinates from becoming an accidental sighting at (0, 0).
- Oversized bcrypt login inputs now return an authentication failure instead of 500.
- Invalid animal/sighting UUIDs now fail request validation before database queries.
- Added coordinate bounds and database-aligned input length limits.
- Added regression tests and included backend unit tests in the release checker.
- Adjusted readiness checks for same-origin hosting, which requires no CORS preflight.
- Updated frontend dependencies and both lockfiles; regenerated OpenAPI.
- Corrected repository documentation and documented Windows/WSL startup.

## Remaining device checks and limits

Browser testing simulated location and selected an image file. Real iPhone/Android
GPS permission prompts, camera capture, photo orientation, and cellular connectivity
still need testing on physical devices. Open the public URL on your phone, create
an account, allow location/camera, add an animal, and report another sighting.

Two existing sample animal records reference `example.com` photo URLs, which do
not provide usable photos. They were preserved; newly uploaded photos worked.

This was a functional review and test pass, not an exhaustive security or load
audit. Dependency auditing above covers npm; Python dependency compatibility was
checked with `pip check`. Existing MVP limits such as no pagination remain.

All code changes are local and uncommitted; nothing was pushed to GitHub.
