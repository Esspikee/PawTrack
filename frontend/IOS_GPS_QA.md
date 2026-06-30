# PawTrack iOS GPS QA

Use this checklist after deploying the frontend to Cloudflare.

## Requirements

- Frontend opens from an `https://` Cloudflare URL.
- API requests use `https://` URLs as well.
- iPhone has Location Services enabled.
- Safari or the installed PawTrack web app has location permission enabled.

## Safari Test

1. Open the Cloudflare PawTrack URL in iPhone Safari.
2. Log in.
3. Go to `Nuevo animal`.
4. Confirm the location section shows a hint asking the user to tap `Localizar`.
5. Tap `Localizar`.
6. Allow location permission when iOS asks.
7. Confirm `Latitud` and `Longitud` fill with numeric values.
8. Repeat from `Nuevo avistamiento`.

## Installed Web App Test

1. In Safari, add PawTrack to the home screen.
2. Open PawTrack from the home-screen icon.
3. Repeat the `Nuevo animal` and `Nuevo avistamiento` tests.
4. If iOS blocks permission, confirm the app shows a clear Spanish fallback message.
5. Confirm manual coordinate entry still allows the form to continue with valid coordinates.

## Expected Results

- iOS does not request location automatically when the screen loads.
- GPS starts only after tapping `Localizar`.
- If the first location attempt times out, PawTrack retries with higher accuracy.
- If GPS is unavailable, denied, or too slow, users can still enter coordinates manually.
- Android and desktop behavior still auto-locates on page load.
