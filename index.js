/*!
 * trek-method-override
 * Copyright(c) 2017 Fangdun Cai
 * MIT Licensed
 */

'use strict'

const vary = require('vary')

const defaults = {
  method: 'POST',
  tokenLookup: 'header:X-HTTP-Method-Override'
}

module.exports = methodOverrideWithConfig

function methodOverrideWithConfig (options = {}) {
  options = Object.assign({}, defaults, options)

  const { method, tokenLookup } = options

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

  function methodOverride ({ req, res }, next) {
    req.originalMethod = req.originalMethod || req.method

    const m = (method === req.originalMethod) && extractor(field, req, res)

    if (m) {
      req.method = m.toUpperCase()
    }

    return next()
  }
}

function methodFromHeader (header, req, res) {
  // Set appropriate Vary header
  vary(res, header)

  return req.get(header)
}

function methodFromForm (param, req) {
  return req.body[param]
}

function methodFromQuery (param, req) {
  return req.query[param]
}
