all: css js

init:
	npm install --save almond requirejs requirejs-text jquery ractive rv

css:
	node_modules/requirejs/bin/r.js -o cssIn=css/widget-styles.css out=css/widget-styles_embed.css

js:
	node_modules/requirejs/bin/r.js -o embed.build.js