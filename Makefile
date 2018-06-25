all: css js

init:
	npm install --save almond requirejs requirejs-text jquery ractive rv

css:
	node_modules/requirejs/bin/r.js -o cssIn=css/my-widget.css out=css/my-widget_embed.css

js:
	node_modules/requirejs/bin/r.js -o embed.build.js