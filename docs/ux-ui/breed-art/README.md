# Códice breed artwork

22 individually generated pixel-art sprites: 11 dog entries and 11 cat entries, matching the IDs in `frontend/src/data/breeds.js`.

## Files and generation

- Production files: `frontend/public/images/breeds/<codex-id>.webp`.
- Original generated PNG files: `originals/<codex-id>.png` in this directory.
- Exact prompt for each image: [prompts.json](prompts.json).
- Labeled visual review: [contact-sheet.png](contact-sheet.png).
- Generator: built-in `image_gen` tool, transparent background, one independent generation per entry; no CLI/API fallback.
- Delivery: transparent lossless WebP, 256 × 256, resized with nearest-neighbor sampling. All 22 production files total 1,046,382 bytes. Originals are retained for future edits.

These are representative illustrated coat examples, not an exhaustive representation of every color or individual in a breed. Criollo is represented by mixed-breed animals, and Negro by a solid-black domestic cat. The existing catalog labels and discovery rules are unchanged.

## Visual matching

Each sprite was reviewed with its label, emphasizing distinct features: smooth Labrador versus feathered Golden; husky mask versus German Shepherd saddle; Schnauzer beard; Yorkshire blue-and-tan coat; Pug muzzle and curled tail; Bengal rosettes; Persian and Himalayan long coats; Siamese short coat; Ragdoll white face marking; Maine Coon ear tufts; Sphynx hairlessness; British round face/copper eyes versus Russian Blue wedge face/green eyes.

Appearance references consulted: [AKC Labrador](https://www.akc.org/dog-breeds/Labrador-retriever/), [AKC Yorkshire Terrier](https://www.akc.org/dog-breeds/yorkshire-terrier/), [CFA British Shorthair](https://cfa.org/breed/british-shorthair/), [CFA Russian Blue](https://cfa.org/breed/russian-blue/), [CFA Ragdoll](https://cfa.org/breed/ragdoll/), and [UKC American Pit Bull Terrier standard](https://www.ukcdogs.com/docs/breeds/american-pit-bull-terrier.pdf).

## Integration and verification

`BreedSprite` resolves images by catalog ID, independently of order, filtering, or displayed breed name. The collection and detail page use the same component. Undiscovered artwork remains muted; discovered artwork is in color. Detail pages retain the user's first sighting photo separately from the illustration. Failed image loads fall back to a paw icon.

Validation passed: 61 frontend tests, ESLint, production build, all 22 public image URLs loading at 256px, every collection row's image filename matching its detail-route ID, species/search filtering, breed-detail navigation, and responsive checks at 320, 390, 768 and 1440px. Browser integration checks used intercepted account data and made no database changes.
