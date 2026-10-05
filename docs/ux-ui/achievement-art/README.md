# Achievement badge artwork

The 29 current backend achievements now use 13 illustrated pixel-art families with independent rarity frames and tier markers. The same badge component is used in Códice and the achievement unlock toast.

## Deliverables

- [Complete badge preview](contact-sheet.png), rendered from the actual React badge markup and styles with demonstration earned states.
- [Exact generation prompts](prompts.json).
- Full-size transparent PNG sources: `originals/<family>.png` in this directory.
- Production files: `frontend/public/images/achievements/<family>.webp` (13 transparent, lossless WebP files, 192 × 192; 547,318 bytes total).
- Generation: built-in `image_gen`, one image per family. No CLI/API fallback. Delivery copies use nearest-neighbor resizing; originals are retained.

## Visual rules

- Explicit backend IDs select artwork in `frontend/src/data/achievementArt.js`; titles and row order never determine the image.
- Exploration uses a compass, Husky milestones a Husky bust, dog/cat families their respective portraits, collection an illustrated book, and daily activity a field journal.
- Master collector and veteran have separate artwork and crown details. Dog/cat lover milestones use a heart detail to distinguish them from breed-collection tiers.
- Tier numerals and incremental frame details distinguish progression even where rarity is shared (such as Husky tiers I and II).
- Rarity frames: neutral, green, blue, purple, gold. Rarity text and tier numerals remain available so color is not the only cue.
- Pending illustrations are muted; earned badges are full color. Hidden, unearned achievements always show the neutral sealed mystery badge, without their family, tier, rarity, or name in its accessible label. Completed hidden achievements reveal their actual emblem.
- Unmapped future achievements and failed images display a framed trophy fallback. Hidden image failures use a lock fallback.

## Validation

The complete backend catalog was compared with the artwork mapping: all 29 IDs are covered. Browser checks verified every expected family image, all 13 assets loading, pending/earned/hidden states, tier rendering, and layouts at 320, 390 and 768 pixels with no browser exceptions. Preview data was intercepted locally; no achievement data was changed. Production build, ESLint, and 65 frontend tests passed.
