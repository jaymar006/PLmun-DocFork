# AGENTS.md

## Project shape
- Static browser app, no build step or package manager. `index.html` loads `app.js` + `style.css` and works from `file://`.
- `_smoke.html` + `_smoke.js` is the only verification harness. It is intentionally not included by `index.html`.

## Commands
- Run app: open `index.html` in a browser.
- Verify: open `_smoke.html`; every line in `<pre id="smoke">` should start `PASS`. The harness clears `localStorage` itself.
- Reset persisted data manually: clear `localStorage` key `plmun-portal-v1` (and `plmun-theme` for theme).

## Architecture (app.js)
- Global objects, no modules: `Store` (mock DB in localStorage), `Auth`, `Views`, `UI`, `Actions`, `ReqDetails`, `Receipt`.
- Single delegated click listener at the bottom dispatches `[data-act]` elements to `Actions[act]`. New interactions need both an `Actions` method and `data-act` in markup.
- `Store.init()` migrates/merges document types and backfills fields; changing seed data only affects fresh stores unless storage is cleared.

## Conventions
- Inline SVG icons come from `icon(name)`; default svg size is `1em`. Context-specific sizes are set in CSS.
- Escape dynamic HTML with `esc()`.
- Demo logins: admin `admin@plmun.edu.ph` / `admin123`; registrar `maria.registrar@gmail.com` / `registrar123`; student `student@plmun.edu.ph` / `student123`.

## Gotchas
- Do not add `_smoke.js` to `index.html`.
- Editing `Store.seed()` won't update existing persisted stores.
- CSS is large and heavily customized; prefer targeted edits.