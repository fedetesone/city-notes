# City Notes

A static, dependency-free city guide for GitHub Pages. Open `index.html` directly, or serve the folder with `python3 -m http.server 8080`.

## Editing

Edit `places.js` to add/remove a place. Each entry has a stable unique `id`, a `city` key, `name`, `category`, `area`, `description`, and `source`. Optional `maps` preserves a specific Google Maps URL; `query` controls a generated Maps search; `website` supplies the More info link. No API keys or build tools are required.

Add another city under `cities` with its name, code, headline, description, note, walkTitle, walkDescription, and stops. Add place entries using its key. City navigation and neighborhood filters update automatically. Categories are defined in `app.js`.

The heart buttons save a visitor's shortlist only in localStorage on their current browser/device. They do not edit the public guide or sync with Google Maps. Use `?city=nyc` to link directly to New York.

## Sources and editorial choices

Initial edition: 2026-10-22. Buenos Aires has six researched starting suggestions; public source links are on each card. NYC has selected recommendations adapted from a June 2023 email, plus selected venues from the shared NYC Google Maps recommendations list reviewed on 2026-10-22. Email text, addresses, personal context, private locations, ratings, and reviews are not bundled. No claim is made that every venue has been personally visited or that historic menu recommendations remain available. Venue information can change; follow Maps and official links before visiting.

The original Dante email URL was malformed. Caffè Dante on MacDougal Street is used as an explicit editorial interpretation and labeled accordingly. Massara On Park, marked permanently closed in Maps, and the ambiguous dropped pin were excluded. The guide includes a selection, not all 47 list entries.

## Google Maps approach

For now, keep a curated catalog with direct Maps links. Shared lists and links supplied in chat can be reviewed and merged into this file, preserving provenance and stable IDs and checking for duplicates. This is a manual editorial import, not automatic sync. Google Maps URLs do not require an API key: https://developers.google.com/maps/documentation/urls/get-started

For larger imports, review an exported list (for example Google Takeout) locally, select the intended venues, and merge only approved public-facing place fields. Avoid publishing raw exports, personal notes, home/work labels, or location history. Future enrichment can use the official Places API with an appropriate backend and API restrictions; review current Google storage, display, attribution, and billing rules before implementing. Never put a private API key in this public repository.

## Deployment

GitHub repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`. `.nojekyll` keeps this a plain static site. Updates to the files on main are published by GitHub Pages.
