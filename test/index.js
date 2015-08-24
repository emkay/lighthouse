const test = require('tape')
const Lighthouse = require('..')
const request = require('request')
var lh = Lighthouse({config: __dirname + '/context.toml'})

test('read config', function (t) {
  t.plan(5)
  lh.readConfig(__dirname + '/context.toml', function (err, data) {
    t.notOk(err, 'should not have an error')
    t.equal(data.title, 'Tests')
    t.equal(data.yes.value, 'no')
    t.equal(data.lang['en-US'].value, true)
    t.equal(data.lang['en-UK'].value, false)
  })
})

test('create server', function (t) {
  t.plan(3)
  lh.createServer({config: __dirname + '/context.toml'})

  request.get('http://localhost:8080/', function (err, res, body) {
    var data = JSON.parse(body)
    t.notOk(err, 'should not have an error')
    t.equal(data.value, 'all')
  })

  var options = {
    url: 'http://localhost:8080/',
    headers: {
      'Accept-Language': 'en-US'
    }
  }
  request(options, function (err, res, body) {
    t.notOk(err, 'should not have an error')
    lh.closeServer()
  })
})

test('getFeatures', function (t) {
  t.plan(6)

  lh.getFeatures({lang: 'en-US'}, function (err, data) {
    t.notOk(err, 'should not have an error')
    t.equal(data.value, true)
    t.equal(data.tacos, true)
  })

  lh.getFeatures({lang: 'en-UK'}, function (err, data) {
    t.notOk(err, 'should not have an error')
    t.equal(data.value, false)
    t.equal(data.tacos, false)
  })
})
