({
  mainConfigFile: "config.js",
  optimize: 'uglify2',
  name: "node_modules/almond/almond", // assumes a production build using almond
  include: ['embed'],
  out: "embed.min.js",
  optimizeCss: "standard",
  stubModules: ['rvc', 'amd-loader', 'text']
})