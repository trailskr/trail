const code =
`
import {out} from 'std'
a: 1
b: a + 1
out(b)
`

let tab = ' .'
let indent = ''
const log = (toIndent, ...args) => {
  if (toIndent === true) indent += tab
  console.log(indent, ...args)
  if (toIndent === false) indent = indent.slice(0, indent.length - tab.length)
}

let logging = true
const logger = (name, fn, params) => {
  if (logging) {
    return (code) => {
      log(true, `parsing ${name}${params ? ' ' + params : ''} on ${pos} "${code.slice(pos, pos + 15)}"`)
      const result = fn(code)
      if (result === undefined) {
        log(false, `not parsed ${name}`)
      } else {
        log(false, `parsed ${name} ${JSON.stringify(result)}`)
      }
      return result
    }
  } else {
    return fn
  }
}

const make = (name, fn, params) => {
  const parser = logger(name, fn, params)
  Object.defineProperty(parser, 'skp', {
    get() {
      parser.skip = true
      return parser
    }
  })
  Object.defineProperty(parser, 'opt', {
    get() {
      parser.optional = true
      return parser
    }
  })
  parser.transform = fn => make('wrapper', (code) => {
    const result = parser(code)
    if (result === undefined) return undefined
    return fn(result)
  })
  return parser
}

let pos = 0

const wrap = p => make('wrapper', (code) => p(code))

const range = (from, to) => make('range', (code) => {
  const c = code[pos]
  if (c >= from && c <= to) {
    pos += 1
    return c
  }
  return undefined
}, `from: ${JSON.stringify(from)}, to: ${JSON.stringify(to)}`)

const s = (str) => make('string', (code) => {
  const len = str.length
  for (let i = 0; i < len; i += 1) {
    if (code[pos + i] !== str[i]) return undefined
  }
  pos += str.length
  return str
}, JSON.stringify(str))

const c = (char) => make('char', (code) => {
  if (code[pos] !== char) return undefined
  pos += 1
  return char
}, JSON.stringify(char))

const anyChar = make('any char', (code) => {
  const res = code[pos]
  pos += 1
  return res
})

const exceptChar = (char, escape) => {
  if (escape === undefined) {
    make('except', (code) => {
      const res = code[pos]
      if (res === char) return undefined
      pos += 1
      return res
    }, `${JSON.stringify(char)}, escape: '${escape}'`)
  } else {
    return make('except', (code) => {
      const res = code[pos]
      if (res === char && code[pos - 1] !== escape) return undefined
      pos += 1
      return res
    }, `${JSON.stringify(char)}, escape: '${escape}'`)
  }
}

const or = (...args) => make('or', (code) => {
  for (const p of args) {
    const res = p(code)
    if (res === undefined) continue
    return res
  }
  return undefined
})

const join = (...args) => make('join', (code) => {
  let result = ''
  const len = args.length
  for (let i = 0; i < len; i += 1) {
    const p = args[i]
    const res = p(code)
    if (res === undefined) {
      if (p.optional) continue
      return undefined
    }
    if (!p.skip) result += res
  }
  return result.length > 0 ? result : undefined
})

const pattern = (...args) => make('pattern', (code) => {
  const result = []
  const len = args.length
  const from = pos
  for (let i = 0; i < len; i += 1) {
    const p = args[i]
    const res = p(code)
    if (res === undefined) {
      if (p.optional) continue
      pos = from
      return undefined
    }
    if (!p.skip) result.push(res)
  }
  if (result.length > 0) {
    return result
  } else {
    pos = from
    return undefined
  }
})

const one = (...args) => make('one in pattern', (code) => {
  const result = []
  const len = args.length
  const from = pos
  for (let i = 0; i < len; i += 1) {
    const p = args[i]
    const res = p(code)
    if (res === undefined) {
      if (p.optional) continue
      pos = from
      return undefined
    }
    if (!p.skip) result.push(res)
  }
  if (result.length > 0) {
    return result[0]
  } else {
    pos = from
    return undefined
  }
})

const repeatChar = (p, min, max) => make('repeat char', (code) => {
  let i
  const from = pos
  for (i = 0; i < max; i += 1) {
    const res = p(code)
    if (res === undefined) break
  }
  if (i < min) {
    pos = from
    return undefined
  }
  return code.slice(from, pos)
})

const repeat = (p, min, max) => make('repeat', (code) => {
  const result = []
  let i
  const from = pos
  for (i = 0; i < max; i += 1) {
    const res = p(code)
    if (res === undefined) break
    result.push(res)
  }
  if (i < min) {
    pos = from
    return undefined
  }
  return result
})

const series = (parser, divider = c(',')) => {
  return pattern(parser, repeat(one(divider.skp, WS, parser), 0, Infinity).opt).transform(([first, rest]) => ([first, ...rest]))
}

const WS = repeatChar(or(c('\u0020'), c('\u0009'), c('\u000B'), c('\u000C')), 1, Infinity).skp
const LE = repeatChar(or(c('\u000A'), c('\u000D'), s('\u000D\u000A'), c('\u2028'), c('\u2029'), 1, Infinity))
const UPPER = range('A', 'Z')
const LOWER = range('a', 'z')
const DIGIT = range('0', '9')
const NON_ZERO_DIGIT = range('1', '9')
const DASH = c('_')
const DOLLAR = c('$')

const IDENTIFIER_FIRST = or(UPPER, LOWER, DASH, DOLLAR)
const IDENTIFIER_REST = or(UPPER, LOWER, DASH, DOLLAR, DIGIT)
const IDENTIFIER = join(IDENTIFIER_FIRST, repeatChar(IDENTIFIER_REST, 0, Infinity))

const INTEGER = join(c('-').opt, NON_ZERO_DIGIT, repeatChar(DIGIT, 0, Infinity))

const STRING_SINGLE_QUOTE = join(c("'"), repeatChar(exceptChar("'", '\\'), 0, Infinity), c("'"))
const STRING_DOUBLE_QUOTE = join(c('"'), repeatChar(exceptChar("'", '\\'), 0, Infinity), c('"'))
const STRING = or(STRING_SINGLE_QUOTE, STRING_DOUBLE_QUOTE)

const pImportAlias = one(s('as').skp, WS, IDENTIFIER).opt
const pImportItem = pattern(IDENTIFIER, one(WS, pImportAlias).opt).transform(([identifier, alias]) => ({identifier, alias}))
const pImportItems = one(c('{').skp, series(pImportItem), c('}').skp).opt
const pImport = pattern(s('import').skp, WS, pImportItem, WS, pImportItems, WS, s('from').skp, WS, wrap(STRING_SINGLE_QUOTE))
  .transform(([main, imports, path]) => ({main, imports, path}))

const show = arg => {
  pos = 0
  console.log(`\nresult: ${JSON.stringify(arg, null, '  ')}\n`)
}

show(pImport("import asd as n {out, a as b} from 'std'"))
