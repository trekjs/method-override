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

test('with header should work missing header', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'header:X-HTTP-Method-Override'
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

test('with header should be case in in-sensitive', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'header:X-HTTP-Method-Override'
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
      'Content-Type': 'application/json',
      'X-HTTP-Method-Override': 'DELete'
    }
  })

  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with header should ignore invalid methods', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'header:X-HTTP-Method-Override'
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
      'Content-Type': 'application/json',
      'X-HTTP-Method-Override': 'BOGUS'
    }
  })

  t.is(res.headers['x-got-method'], 'POST')
})

test('with header should handle multiple headers', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'header:X-HTTP-Method-Override'
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
      'Content-Type': 'application/json',
      'X-HTTP-Method-Override': 'DELETE, PUT'
    }
  })

  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with header should set Vary header', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'header:X-HTTP-Method-Override'
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
      'Content-Type': 'application/json',
      'X-HTTP-Method-Override': 'DELETE'
    }
  })

  t.is(res.headers.vary, 'X-HTTP-Method-Override')
  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with header should set Vary header even with no override', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'header:X-HTTP-Method-Override'
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

  t.is(res.headers.vary, 'X-HTTP-Method-Override')
  t.is(res.headers['x-got-method'], 'POST')
})

test('give "options.methods"', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    methods: ['POST', 'PATCH']
  }))

  app.use(({ req, res }) => {
    res.set('X-Got-Method', req.method)
    res.end()
  })

  const uri = await listen(app)
  const res = await request({
    uri,
    method: 'PATCH',
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': 'application/json',
      'X-HTTP-Method-Override': 'DELETE'
    }
  })

  t.is(res.headers.vary, 'X-HTTP-Method-Override')
  t.is(res.headers['x-got-method'], 'DELETE')
})

test('with query should work missing form', async t => {
  const app = new Engine()

  app.use(bodyParser())
  app.use(methodOverride({
    tokenLookup: 'form:_method'
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
    },
    form: {
      _method: 'PATCH'
    }
  })

  t.is(res.headers['x-got-method'], 'PATCH')
})

