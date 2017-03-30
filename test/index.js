import test from 'ava'
import request from 'request-promise'
import Engine from 'trek-engine'
import bodyParser from 'trek-body-parser'
import methodOverride from '..'

const listen = app => {
  return new Promise((resolve, reject) => {
    app.run(function (err) {
      if (err) {
        return reject(err)
      }

      const { port } = this.address()
      resolve(`http://localhost:${port}`)
    })
  })
}

test('should not touch the method by default', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride())

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({ uri, resolveWithFullResponse: true })

  t.is(res.headers['x-got-method'], 'GET')
})

test('should use X-HTTP-Method-Override by default', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride())

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri,
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {
      'X-HTTP-Method-Override': 'DELETE'
    }
  })

  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with query should work missing query', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'query:_method'
  }))

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri,
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  t.is(res.headers['x-got-method'], 'POST')
})

test('with query should be case in-sensitive', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'query:_method'
  }))

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri: uri + '?_method=DELete',
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with query should ignore invalid methods', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'query:_method'
  }))

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri: uri + '?_method=BOGUS',
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  t.is(res.headers['x-got-method'], 'POST')
})

test('with query should handle key referencing array', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'query:_method'
  }))

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri: uri + '?_method=DELETE&_method=PUT',
    method: 'POST',
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with query should only work with POST', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'query:_method'
  }))

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri: uri + '?_method=PATCH',
    method: 'DELETE',
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  t.is(res.headers['x-got-method'], 'DELETE')
})

