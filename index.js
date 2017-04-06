/*!
 * trek-method-override
 * Copyright(c) 2017 Fangdun Cai <cfddream@gmail.com> (https://fundon.me)
 * MIT Licensed
 */

'use strict'

const { METHODS } = require('http')
const vary = require('vary')

const defaults = {
  methods: ['POST'],
  tokenLookup: 'header:X-HTTP-Method-Override'
}

module.exports = methodOverrideWithConfig

function methodOverrideWithConfig (options = {}) {
  options = Object.assign({}, defaults, options)

  const { methods, tokenLookup } = options

  const [via, field] = tokenLookup.split(':')

  let extractor = methodFromHeader

  switch (via) {
    case 'form':
      extractor = methodFromForm
      break
    case 'query':
      extractor = methodFromQuery
      break
    // No default
  }

  return methodOverride

  function methodOverride ({ req, rawRes }, next) {
    req.originalMethod = req.originalMethod || req.method

    if (methods.includes(req.originalMethod)) {
      let m = extractor(field, req, rawRes)

      if (Array.isArray(m)) m = m[0]

      if (m) {
        m = m.toUpperCase()
        if (METHODS.includes(m)) req.method = m
      }
    }

    return next()
  }
}

function methodFromHeader (header, req, rawRes) {
  // Set appropriate Vary header
  vary(rawRes, header)

  // Multiple headers get joined with comma by node core
  return (req.get(header) || '').split(/ *, */)
}

function methodFromForm (param, req) {
  return req.body[param]
}

function methodFromQuery (param, req) {
  return req.query[param]
}
