# Project: OpenStack Search Bar Widget

**Last Updated:** 2026-03-11

## Overview

Embedded search bar widget for OpenStack sites. Provides search with autocomplete suggestions and paginated results via a popup overlay. Designed to be embedded on any page via a single `<div>` + script tag.

## Technology Stack

- **Language:** JavaScript (ES5, no transpilation)
- **Module System:** RequireJS (AMD) with `almond` for production builds
- **UI Framework:** Ractive.js 0.10.x (reactive templates with mustache syntax)
- **DOM / AJAX:** jQuery 3.x (`$.noConflict()` mode — always use `$` from the AMD module, never global)
- **Build Tool:** RequireJS Optimizer (`r.js`) via Makefile
- **Icons:** Font Awesome 4.7 (loaded externally by the embedding page)
- **Tests:** None configured

## Directory Structure

```
├── app/app.js          # Main widget logic (search, suggestions, pagination)
├── config.js           # RequireJS path configuration
├── embed.js            # Entry point — loads jQuery + app, calls app.init()
├── embed.build.js      # r.js optimizer build config
├── embed.min.js        # Built/minified output (committed)
├── css/widget-styles.css
├── templates/template.html  # Ractive template (mustache syntax)
├── example/index.html       # Test page for the widget
└── Makefile
```

## Key Files

- **Entry Point:** `embed.js` → requires `app/app.js` → calls `app.init()`
- **Build Config:** `embed.build.js` (r.js optimizer settings)
- **RequireJS Paths:** `config.js` (maps module names to `node_modules/` paths)
- **Output:** `embed.min.js` (self-contained bundle with almond loader)

## Development Commands

| Task | Command |
|------|---------|
| Install deps | `make init` (or `npm install`) |
| Build CSS | `make css` |
| Build JS | `make js` |
| Build all | `make` |
| Test locally | Open `example/index.html` in a browser after building |

## Architecture

### Embedding

Host pages add a `<div class="openstack-search-bar">` with data attributes and load `embed.min.js`:

```html
<div class="openstack-search-bar" data-baseUrl="search.openstack.org" data-context="www-openstack"></div>
```

- `data-baseUrl` — API host (default: `search.openstack.org`)
- `data-context` — search context/scope (default: `www-openstack`)

### API Endpoints

All requests go to `https://{baseUrl}/api/public/v1/`:

| Endpoint | Purpose |
|----------|---------|
| `search/{context}/{term}?page=N&page_size=N` | Full search with pagination |
| `suggestions/{context}/{term}` | Autocomplete suggestions |

### Widget Lifecycle

1. `embed.min.js` loads → RequireJS resolves AMD modules
2. `app.init()` finds all `.openstack-search-bar` elements
3. Each element gets its own Ractive instance with search/suggestion/pagination state
4. CSS is injected into `<head>` at runtime
