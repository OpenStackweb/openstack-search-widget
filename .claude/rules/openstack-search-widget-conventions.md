# Coding Conventions

## AMD Modules

All JS files use RequireJS AMD format. Never use CommonJS `require()` or ES modules.

```javascript
// Correct — AMD define with dependency array
define(['jquery', 'ractive', 'rv!templates/template'], function ($, Ractive, mainTemplate) {
    'use strict';
    // ...
});
```

Module paths are mapped in `config.js`. When adding a dependency:
1. `npm install --save <package>`
2. Add path mapping to `config.js`
3. Add to `define([...])` dependency array

## jQuery noConflict

jQuery runs in `$.noConflict()` mode. **IMPORTANT:** Always use the `$` variable from the AMD module parameter, never assume a global `$` or `jQuery`.

```javascript
// Correct — $ comes from the AMD define callback
define(['jquery'], function ($) {
    $.ajax({ ... });
    $('.ossw-search-bar', el).show();
});
```

## Ractive Templates

- Templates use Ractive mustache syntax (`{{variable}}`, `{{{unescaped}}}`, `{{#if}}`, `{{#each}}`)
- Located in `templates/` directory
- Loaded via RequireJS `rv!` plugin: `'rv!templates/template'`
- Events bound with `on-click="eventName"` and `on-keyup="eventName"`

## CSS

- All widget classes use the `ossw-` prefix (OpenStack Search Widget) to avoid conflicts with host page styles
- CSS is loaded as a text module and injected into `<head>` at runtime — no external stylesheet link needed
- Widget uses `z-index` values in the 99999991–99999997 range for the popup overlay

## API Integration

- AJAX calls use `$.ajax()` with `dataType: "json"`
- Suggestions use a debounce pattern: 500ms `setTimeout` + abort previous XHR
- Search results prefer `meta_title`/`meta_description` over `title`/`content`
- Result detail text is truncated to 100 characters (`MAX_DETAIL_LEN`)

## Build Output

`embed.min.js` is committed to the repo. After any JS or template change, rebuild with `make js` and commit the updated `embed.min.js`.
