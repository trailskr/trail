const util = require('util')

let tab = ' .'
let indent = ''
let globalLogging = true
const log = (toIndent, ...args) => {
  if (toIndent === false) indent = indent.slice(0, indent.length - tab.length)
  if (globalLogging) {
    args.forEach(arg => {
      console.log(indent, arg)
    })
  }
  if (toIndent === true) indent += tab
}

const loggable = (name, parse, params) => {
  return function (code) {
    if (this.message) {
      log(true, `parsing ${this.message}\`, \`on ${JSON.stringify(code.slice(pos, pos + 15))}`)
      globalLogging = false
    } else {
      log(true, `parsing ${name}${params ? ' ' + params : ''}`, `on ${JSON.stringify(code.slice(pos, pos + 15))}`)
    }
    const result = parse(code)
    if (this.message) {
      globalLogging = true
      if (result === undefined) {
        log(false, `not parsed ${this.message}`)
      } else {
        log(false, `parsed ${this.message} ${JSON.stringify(result)}`)
      }
    } else {
      if (result === undefined) {
        log(false, `not parsed ${name}`)
      } else {
        log(false, `parsed ${name} ${JSON.stringify(result)}`)
      }
    }
    return result
  }
}

let pos = 0

const baseParserProto = Object.create(null, {
  start: {
    value(code) {
      pos = 0
      return this.parse(code)
    }
  },
  skp: {
    get() {
      this.skip = true
      return this
    }
  },
  opt: {
    get() {
      this.optional = true
      return this
    }
  },
  msg: {
    value(msg) {
      this.message = msg
      this.params = msg
      return this
    }
  },
  transform: {
    value(transformFn) {
      const parse = this.parse
      this.parse = (code) => {
        const result = parse.call(this, code)
        if (result === undefined) return undefined
        return transformFn(result)
      }
      return this
    }
  }
})

const createParser = (name, parse, params, parsers) => {
  const parser = Object.create(baseParserProto)
  parser.name = name
  parser.parse = loggable(name, parse, params, parsers)
  if (params) parser.params = params
  if (parsers) parser.parsers = parsers

  return parser
}

const range = (from, to) => createParser('range', function (code) {
  const c = code[pos]
  if (c >= from && c <= to) {
    pos += 1
    return c
  }
  return undefined
}, `from: ${JSON.stringify(this.from)}, to: ${JSON.stringify(this.to)}`, undefined)

const s = (str) => createParser('string', function (code) {
  const len = str.length
  for (let i = 0; i < len; i += 1) {
    if (code[pos + i] !== str[i]) return undefined
  }
  pos += str.length
  return str
}, JSON.stringify(str), undefined)

const c = (char) => createParser('char', function (code) {
  if (code[pos] !== char) return undefined
  pos += 1
  return char
}, JSON.stringify(char), undefined)

// const anyChar = createParser('any char', function (code) {
//   const res = code[pos]
//   pos += 1
//   return res
// }, undefined, undefined)

const exceptChar = (char, escape) => {
  if (escape === undefined) {
    return createParser('except', function (code) {
      const res = code[pos]
      if (res === char) return undefined
      pos += 1
      return res
    }, `${JSON.stringify(char)}, escape: '${escape}'`, undefined)
  } else {
    return createParser('except', function (code) {
      const res = code[pos]
      if (res === char && code[pos - 1] !== escape) return undefined
      pos += 1
      return res
    }, `${JSON.stringify(char)}, escape: '${escape}'`, undefined)
  }
}

const or = (...parsers) => createParser('or', function (code) {
  for (const parser of parsers) {
    const res = parser.parse(code)
    if (res === undefined) continue
    return res
  }
  return undefined
}, `[${parsers.map(parser => `${parser.name}: ${parser.params}`).join(', ')}]`, parsers)

const join = (...parsers) => createParser('join', function (code) {
  let result = ''
  const len = parsers.length
  for (let i = 0; i < len; i += 1) {
    const parser = parsers[i]
    const res = parser.parse(code)
    if (res === undefined) {
      if (parser.optional) continue
      return undefined
    }
    if (!parser.skip) result += res
  }
  return result.length > 0 ? result : undefined
}, `[${parsers.map(parser => `${parser.name}: ${parser.params}`).join(', ')}]`, parsers)

const seq = (...parsers) => createParser('seq', function (code) {
  const result = []
  const len = parsers.length
  const from = pos
  for (let i = 0; i < len; i += 1) {
    const parser = parsers[i]
    const res = parser.parse(code)
    if (res === undefined) {
      if (parser.optional) {
        if (!parser.skip) result.push(undefined)
        continue
      }
      pos = from
      return undefined
    }
    if (!parser.skip) result.push(res)
  }
  if (result.length > 0) {
    return result
  } else {
    pos = from
    return undefined
  }
}, `[${parsers.map(parser => `${parser.name}: ${parser.params}`).join(', ')}]`, parsers)

const one = (...parsers) => createParser('one in seq', function (code) {
  const result = []
  const len = parsers.length
  const from = pos
  for (let i = 0; i < len; i += 1) {
    const parser = parsers[i]
    const res = parser.parse(code)
    if (res === undefined) {
      if (parser.optional) continue
      pos = from
      return undefined
    }
    if (!parser.skip) result.push(res)
  }
  if (result.length > 0) {
    return result[0]
  } else {
    pos = from
    return undefined
  }
}, `[${parsers.map(parser => `${parser.name}: ${parser.params}`).join(', ')}]`)

const repeatChar = (parser, min, max) => createParser('repeat char', function (code) {
  let i
  const from = pos
  for (i = 0; i < max; i += 1) {
    const res = parser.parse(code)
    if (res === undefined) break
  }
  if (i < min) {
    pos = from
    return undefined
  }
  return code.slice(from, pos)
}, `${JSON.stringify(parser)} from ${min} times to ${max}`, undefined)

const repeat = (parser, min, max) => createParser('repeat', function (code) {
  const result = []
  let i
  const from = pos
  for (i = 0; i < max; i += 1) {
    const res = parser.parse(code)
    if (res === undefined) break
    result.push(res)
  }
  if (i < min) {
    pos = from
    return undefined
  }
  return result
}, `(${parser.name}: ${parser.params}) from ${min} times to ${max}`, undefined)

const series = (parser, divider = c(',')) => {
  return seq(parser, repeat(one(divider.skp, WS, parser), 0, Infinity).opt).transform(([first, rest]) => ([first, ...rest]))
}

const WS = repeatChar(or(c('\u0020'), c('\u0009'), c('\u000B'), c('\u000C')), 1, Infinity).skp.msg('white space')
const EOF = or(c('\u0000'), c('\u0003'))
const LE = repeatChar(or(c('\u000A'), c('\u000D'), s('\u000D\u000A'), c('\u2028'), c('\u2029'), EOF), 1, Infinity).skp.msg('line end')
const UPPER = range('A', 'Z')
const LOWER = range('a', 'z')
const DIGIT = range('0', '9')
const NON_ZERO_DIGIT = range('1', '9')
const DASH = c('_')
const DOLLAR = c('$')

const IDENTIFIER_FIRST_LETTER = or(UPPER, LOWER, DASH, DOLLAR)
const IDENTIFIER_REST_LETTER = or(UPPER, LOWER, DASH, DOLLAR, DIGIT)
const pIdentifier = join(IDENTIFIER_FIRST_LETTER, repeatChar(IDENTIFIER_REST_LETTER, 0, Infinity)).msg('identifier')
  .transform(res => ({type: 'identifier', label: res}))

const pInteger = join(c('-').opt, NON_ZERO_DIGIT, repeatChar(DIGIT, 0, Infinity)).msg('integer')
  .transform(res => ({type: 'integer', value: +res}))

const STRING_SINGLE_QUOTE = join(c('\''), repeatChar(exceptChar('\'', '\\'), 0, Infinity), c('\'')).msg('single quoted string')
  .transform(str => str.replace(/\\'/g, '\'').slice(1, -1))
const STRING_DOUBLE_QUOTE = join(c('"'), repeatChar(exceptChar('"', '\\'), 0, Infinity), c('"')).msg('double quoted string')
  .transform(str => str.replace(/\\"/g, '"').slice(1, -1))
const pString = or(STRING_SINGLE_QUOTE, STRING_DOUBLE_QUOTE).msg('string')
  .transform(res => ({type: 'string', value: res}))

const pImportAlias = one(s('as').skp, WS, pIdentifier).opt
const pImportItem = seq(pIdentifier, one(WS, pImportAlias).opt)
  .transform(([identifier, alias]) => ({identifier, alias}))
const pImportItems = one(c('{').skp, series(pImportItem), c('}').skp)
const pImport = seq(s('import').skp, one(WS, pImportItem).opt, one(WS, pImportItems).opt, WS, s('from').skp, WS, pString)
  .transform(([def, other, path]) => ({type: 'import', default: def, other, path}))

const pLiteral = or(
  pInteger,
  pString
)

const pValue = or(
  pLiteral,
  pIdentifier
)

const pExpression = or(
  pValue
)

const pFunctionCall = seq(pIdentifier, c('(').skp, series(pExpression), c(')'))
  .transform(([name, args]) => ({type: 'functionCall', name, args}))
pExpression.parsers.unshift(pFunctionCall)

const pExpressionBinaryLeft = or(...pExpression.parsers)

const pBinaryOperator = seq(pExpressionBinaryLeft, WS, or(c('+'), c('-'), c('*'), c('/')), WS, pExpression)
  .transform(([left, op, right]) => ({type: 'binaryOperator', op, left, right}))

pExpression.parsers.unshift(pBinaryOperator)

const pDeclaration = seq(pIdentifier, c(':').skp, WS, pExpression)
  .transform(([identifier, value]) => ({type: 'declaration', identifier, value}))

const pStatement = one(
  LE,
  or(
    pImport,
    pDeclaration,
    pExpression
  )
)

const pModule = repeat(pStatement, 0, Infinity)

const show = arg => {
  console.log('\n')
  console.log(util.inspect(arg, false, null))
  console.log('\n')
}

const code = `
import {out} from 'std'
a: 1
b: a + 1 - 10
'some text'
out(b)
`

show(pModule.start(code))
