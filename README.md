# trek-method-override

Method Overrider Middleware for Trek.js


## Installation

```
$ npm install trek-method-override --save
```


## Examples

```js
'use strict'

const Engine = require('trek-engine')
const bodyParser = require('trek-body-parser')
const methodOverride = require('trek-method-override')

async function start () {
  const app = new Engine()

  app.use(bodyParser())

  app.use(methodOverride())

  app.use(ctx => {
    ctx.res.body = {
      method: ctx.req.method,
      originalMethod: ctx.req.originalMethod
    }
  })

  app.on('error', (err, ctx) => {
    console.log(err)
  })

  app.run(3000)
}

start().catch(console.log)
```


## API

```js
methodOverride({
  methods: ['POST'],
  tokenLookup: 'header:X-HTTP-Method-Override'
})
```


## Badges

[![Build Status](https://travis-ci.org/trekjs/method-override.svg?branch=master)](https://travis-ci.org/trekjs/method-override)
[![codecov](https://codecov.io/gh/trekjs/method-override/branch/master/graph/badge.svg)](https://codecov.io/gh/trekjs/method-override)
![](https://img.shields.io/badge/license-MIT-blue.svg)

---

> [fundon.me](https://fundon.me) &nbsp;&middot;&nbsp;
> GitHub [@fundon](https://github.com/fundon) &nbsp;&middot;&nbsp;
> Twitter [@_fundon](https://twitter.com/_fundon)
