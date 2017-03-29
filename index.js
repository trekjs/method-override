/*!
 * trek-method-override
 * Copyright(c) 2017 Fangdun Cai
 * MIT Licensed
 */

'use strict'

const defaults = {
  method: 'POST',
  tokenLookup: 'header:X-HTTP-Method-Override'
}

module.exports = methodOverride

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
    // no default
  }

  return methodOverride

  function methodOverride ({ req, res }, next) {
    req.originalMethod = req.originalMethod || req.method

    if (method === req.originalMethod && (let m = extractor(field, req, res))) {
      req.method = m.toUpperCase()
    }

    return next()
  }

}

function methodFromHeader (header, req, res) {
  return req.get(header)
}

function methodFromForm (param, req) {
  return req.body[param]
}

function methodFromQuery (param, req) {
  return req.query[param]
}
