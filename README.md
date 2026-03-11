# Openstack Search Bar Widget

Search Bar embedded widget using [RequireJS](http://requirejs.org) and [Ractive.js](http://ractivejs.org).

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) (recommended) or Node.js 20+
- [Yarn](https://classic.yarnpkg.com/)

## Building the widget

```console
$ nvm use
$ make init
$ make
```

`make init` runs `yarn install` to fetch dependencies. `make` builds both the CSS and the minified JS bundle (`embed.min.js`).

You can test the result by opening `example/index.html` in a browser.
