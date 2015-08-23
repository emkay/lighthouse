const Lighthouse = require('..')
var lh = Lighthouse()

lh.createServer({config: __dirname + '/config.toml'})
