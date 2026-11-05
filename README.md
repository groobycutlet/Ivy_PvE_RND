# Ivy PvE — Badlands website (JSON content edition)

This is the existing Ivy website design and colour scheme with content moved into JSON files.
The HTML layout and CSS theme are retained. The pages read JSON using browser JavaScript.

## Pages
- `index.html` — landing page and latest-news cards (latest 3 entries)
- `news.html` — announcements from `data/news.json`
- `server.html` — connection details, gameplay and rules from `data/server.json`
- `items.html` — custom item catalogue from `data/items.json`, with category filters
- `vehicles.html` — vehicle showcase from `data/vehicles.json`

## Add or edit content
Edit the relevant JSON file in GitHub or locally:
- `data/news.json`
- `data/items.json`
- `data/vehicles.json`
- `data/server.json`

Add images under:
- `assets/items/`
- `assets/vehicles/`
- `assets/news/` (available for future news image support)

When adding an item or vehicle image, upload the image to its folder and put its relative path in the JSON, e.g. `assets/items/my-kit.png`. Leave `image` as an empty string to use the designed graphic placeholder.

## JSON rules
- Keep double quotes around property names and text values.
- Separate entries with commas.
- Do not put a comma after the final property or final array entry.
- Use `[]` for an empty list and `{}` for an empty object.
- Preserve the outer array `[` `]` in news, items and vehicles files.
- Category filters for items use these exact values: `medical`, `clothing`, `tools`, `weapons`. Other values display under All equipment.

## Publish updates
Commit the changed JSON and any new images to the same GitHub repository. GitHub Pages republishes automatically. If the browser shows old content, hard-refresh with Ctrl+F5.

## Important
This is a static GitHub Pages site; JSON changes are read by the visitor's browser. No database, PHP or server-side service is needed. Test locally through GitHub Pages or a local web server; opening HTML directly as a `file://` URL may block JSON fetch requests in some browsers.

Do not rename the JSON files or move the folders unless you also update the corresponding `data-json` path in the HTML.
