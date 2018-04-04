const code =
`
import {out} from 'std'
a: 1
b: a + 1
out(b)
`

const WS = {variants: ['\u0020', '\u0009', '\u000B', '\u000C'], skip: true}
const LE = {variants: ['\u000D', '\u000A', '\u000D\u000A', '\u2028', '\u2029']}
const UPPER = {range: {from: 'A', to: 'Z'}}
const LOWER = {range: {from: 'a', to: 'z'}}
const DIGIT = {range: {from: '0', to: '9'}}
const DASH = '_'
const DOLLAR = '$'
const NON_ZERO_DIGIT = {range: {from: '1', to: '9'}}

const IDENTIFIER_FIRST = {variants: [UPPER, LOWER, DASH, DOLLAR]}
const IDENTIFIER_REST = {variants: [UPPER, LOWER, DASH, DOLLAR, DIGIT]}
const IDENTIFIER = {join: [IDENTIFIER_FIRST, {repeat: IDENTIFIER_FIRST, max: Infinity}]}

const INTEGER = {join: [{optional: '-'}, NON_ZERO_DIGIT, {repeat: DIGIT, max: Infinity}]}

const STRING_SINGLE_QUOTE = {join: ["'", {repeat: true, max: Infinity, before: "'", except: "\\'"}, "'"]}
const STRING_DOUBLE_QUOTE = {join: ['"', {repeat: true, max: Infinity, before: '"', except: '\\"'}, '"']}
const STRING = {variants: [STRING_SINGLE_QUOTE, STRING_DOUBLE_QUOTE]}
let pos = 0

let tab = '  '
let indent = ''
const log = (toIndent, msg) => {
  if (toIndent === true) indent += tab
  console.log(indent + msg)
  if (toIndent === false) indent = indent.slice(0, indent.length - tab.length)
}

const parse = (parser, code) => {
  if (typeof parser === 'string') {
    log(true, `parsing string "${parser}" on ${pos} "${code.slice(pos, pos + 15)}"`)
    const len = parser.length
    for (let i = 0; i < len; i += 1) {
      if (code[pos + i] !== parser[i]) {
        log(false, 'not parsed')
        return undefined
      }
    }
    pos += len
    log(false, `parsed string ${parser} on ${pos} "${code.slice(pos, pos + 15)}"`)
    return parser
  } else if (parser.keys) {
    log(true, `parsing keys on ${pos} "${code.slice(pos, pos + 15)}"`)
    const result = {}
    let keys = 0
    for (const key in parser.keys) {
      const p = parser.keys[key]
      const res = parse(p, code)
      if (res === undefined) continue
      if (!p.skip) {
        result[key] = res
        keys += 1
      }
    }
    if (keys > 0) {
      return result
    } else {
      log(false, 'not parsed')
      return undefined
    }
  } else if (parser.pattern) {
    log(true, `parsing pattern ${parser.pattern} on ${pos} "${code.slice(pos, pos + 15)}"`)
    const result = []
    for (const p of parser.pattern) {
      const res = parse(p.optional ||p, code)
      if (res === undefined) {
        if (p.optional) continue
        log(false, 'not parsed')
        return undefined
      }
      if (!p.skip) result.push(res)
    }
    log(true, `parsed ${result} on ${pos} "${code.slice(pos, pos + 15)}"`)
    return result
  } else if (parser.join) {
    log(true, `parsing join ${parser.join} on ${pos} "${code.slice(pos, pos + 15)}"`)
    let result = ''
    for (const p of parser.join) {
      const res = parse(p.optional || p, code)
      if (res === undefined) {
        if (p.optional) continue
        log(false, 'not parsed')
        return undefined
      }
      if (!p.skip) result += res
    }
    log(true, `parsed ${result} on ${pos} "${code.slice(pos, pos + 15)}"`)
    return result
  } else if (parser.variants) {
    log(true, `parsing variants ${parser.variants} on ${pos} "${code.slice(pos, pos + 15)}"`)
    for (const p of parser.variants) {
      const res = parse(p, code)
      if (res === undefined) continue
      log(false, `parsed ${res} on ${pos} "${code.slice(pos, pos + 15)}"`)
      return res
    }
    log(false, 'not parsed')
    return undefined
  } else if (parser.range) {
    log(true, `parsing range ${parser.range} on ${pos} "${code.slice(pos, pos + 15)}"`)
    const c = code[pos]
    if (c >= parser.range.from && c <= parser.range.to) {
      pos += 1
      log(false, `parsed ${c} on ${pos} "${code.slice(pos, pos + 15)}"`)
      return c
    }
    log(false, 'not parsed')
    return undefined
  } else if (parser.repeat) {
    log(true, `parsing repeat ${parser.repeat} on ${pos} "${code.slice(pos, pos + 15)}"`)
    const from = pos
    for (let i = 0; i < parser.max; i += 1) {
      if (pos >= code.length) break
      const res = parse(parser.repeat, code)
      if (res === undefined) break
    }
    if (parser.min !== undefined && i < parser.min) {
      pos = from
      log(false, 'not parsed')
      return undefined
    }
    const res = code.slice(from, pos)
    log(false, `parsed ${res} on ${pos} "${code.slice(pos, pos + 15)}"`)
    return res
  }
}

const pImport = {pattern: ['import', WS, IDENTIFIER, WS, 'from', IDENTIFIER]}

console.log(parse(pImport, "import some from something"))
