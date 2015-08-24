const fs = require('fs')
const http = require('http')
const toml = require('toml')
const concat = require('concat-stream')
const response = require('response')
const oa = require('object-assign')
const Negotiator = require('negotiator')

function Lighthouse (options) {
  if (!(this instanceof Lighthouse)) {
    return new Lighthouse(options)
  }

  this.options = options || {}
}

Lighthouse.prototype.readConfig = function readConfig (config, cb) {
  var s = fs.createReadStream(config, 'utf8')

  function parser (data) {
    this.parsed = toml.parse(data)
    cb(null, this.parsed)
  }

  s.pipe(concat(parser))
}

Lighthouse.prototype.getFeatures = function getFeatures (context, cb) {
  this.readConfig(this.options.config, function (err, data) {
    if (err) {
      return cb(err)
    }

    var ret = oa(data.all, data.lang[context.lang])
    cb(null, ret)
  })
}

Lighthouse.prototype.createServer = function createServer (options) {
  var self = this

  function fn (req, res) {
    var negotiator = new Negotiator(req)
    var langs = negotiator.languages()
    var lang = starToAll(langs && langs[0])

    self.readConfig(options.config, function (err, data) {
      if (err) {
        return response.error(new Error('Bad config')).statue(500).pipe(res)
      }

      var ret = oa(data.all, data.lang[lang])
      response.json(ret).status(200).pipe(res)
    })
  }

  this.server = http.createServer(fn).listen(8080)
}

Lighthouse.prototype.closeServer = function closeServer () {
  this.server.close()
}

function starToAll (s) {
  return s === '*' ? 'all' : s
}

module.exports = Lighthouse
