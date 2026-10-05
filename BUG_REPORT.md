# Bug review and fixes — October 4, 2026

This pass found and fixed ten issues in the current app, in addition to the earlier
setup review documented in `QA_REPORT.md`. Fourteen new regression cases failed
against the original behavior before the fixes; all now pass. A further backend
contract test checks that codex breed aliases stay aligned with achievements.

## Findings

| # | Bug and reproduction | Impact | Fix |
|---|---|---|---|
| 1 | Save an animal or sighting successfully, then fail the subsequent profile/achievement refresh. The save promise rejected even though the write succeeded. History actions had the same refresh/error coupling. | Misleading failure messages could lead users to retry and create duplicate records. | Separate completed writes from follow-up refresh failures with `Promise.allSettled`. Actual write failures still propagate. |
| 2 | Start a profile or achievement request, log out, then let the request finish. | The old response restored the previous profile/auth state or achievement points after logout. | Capture the session token and discard results belonging to a session that has ended or changed. |
| 3 | Start an authenticated request with an old token, establish a new session, then receive a 401 from the old request. | The old failure cleared the new session's token and logged the user out. | Clear credentials only if the failed request's token is still the current token. |
| 4 | Refresh profile statistics while viewing a protected page. | The route guard replaced and unmounted the page, losing local form/component state during a background refresh. | Keep the verified page mounted while an existing profile refreshes; initial session verification still shows the loading screen. |
| 5 | Select a photo for a sighting and submit while compression/upload is pending. | The sighting saved with no photo because its URL was not available yet. | Propagate upload state to both capture forms, disable submission while pending, and guard their submit handlers. |
| 6 | Let a photo upload fail, then select the exact same file again. | Browsers did not emit another change event, so the user could not retry that photo. | Reset the file input after failure. Also clear an outdated preview/name when choosing a replacement. |
| 7 | Encounter a history loading error, then navigate to another animal's history using the same mounted page. | The old error remained and hid the successfully loaded history. | Clear loading/action errors when starting a new history load. |
| 8 | Confirm or unconfirm a sighting, then return to the animal catalog. | The catalog retained the previous confirmation count. | Refresh the shared animal list after confirmation changes. |
| 9 | Describe a dog using an alias such as `jusky`, `huskies`, or `siberiano`. | Backend achievements recognized Husky, but the codex did not recognize the discovery. | Add the backend's breed alias vocabulary to codex matching, with a cross-language contract test to detect drift. |
| 10 | Include an unrelated word such as `pugilistas` in a sighting description. | Substring matching incorrectly discovered the Pug breed. | Match complete normalized words/phrases instead of arbitrary substrings. |

## Verification

- **53 frontend tests passed** across 11 test files.
- **8 backend tests passed**, using isolated test databases.
- ESLint, production Vite build, and `git diff --check` passed.
- A headless Chrome check loaded the rebuilt app through the existing Cloudflare
  URL and deliberately delayed photo upload, then simulated a profile HTTP 503
  after saving. Submission stayed disabled during upload, the saved payload
  included the photo, exactly one save occurred, and the app navigated to history.
- No JavaScript exceptions occurred during that browser scenario.
- The real public API `/health` responded successfully.

The browser failure scenario intercepted API calls to make timing deterministic;
it did not write test records to the real database. Earlier real PostgreSQL-backed
smoke coverage remains documented in `QA_REPORT.md`; it was not rerun or counted
as a new result in this pass.

## Delivery and limits

The rebuilt frontend is available at:
https://wing-holmes-victory-plus.trycloudflare.com

Refresh an already open tab to load the fixes. The existing level 1 puppy avatar
is preserved. The tunnel and server remain running, and changes are local and
uncommitted; nothing was pushed to GitHub.

This pass focused on asynchronous user flows, upload handling, history recovery,
and codex matching. It does not establish that the app is free of all bugs.
Physical-device camera/GPS behavior and high-concurrency/load behavior were not
tested here. Existing placeholder photo URLs and incomplete UI translation are
separate limitations; these fixes do not supply missing photos or translations.
