// import {inspect} from 'util'
import {assert, unittest, unitLogger} from './unittests.js'
import {includes} from './utils.js'
import {CodePointer} from './parser/CodePointer.js'
import {represent} from './represent.js'
import {pBlockLines, resetPathTracking} from './main.js'

const parse = (code) => {
  resetPathTracking()
  return pBlockLines(CodePointer(code))[1]
}

const testAst = (sourceCode, resultCode) => {
  assert(() => {
    const result = parse(sourceCode)
    const isIncludes = includes(result, resultCode)
    if (!isIncludes) unitLogger(undefined, `\x1b[31mparsed result\n${inspect(result)}\nis not includes \n${inspect(resultCode)}\x1b[0m`)
    return isIncludes
  })
}

unittest('parsing atoms', () => {
  testAst('true', {type: 'boolean', value: true, pos: {from: {col: 1}, to: {col: 5}}})
  testAst('false', {type: 'boolean', value: false})

  testAst('1', {type: 'integer', value: 1})
  testAst('1050', {type: 'integer', value: 1050})

  testAst('.1', {type: 'fractional', value: 0.1})
  testAst('1e3', {type: 'fractional', value: 1000})
  testAst('0.5e-1', {type: 'fractional', value: 0.05})

  testAst(`'string'`, {type: 'string', value: 'string', pos: {from: {col: 1}, to: {col: 9}}})
  testAst(`"string"`, {type: 'string', value: 'string'})
  testAst(`'\n'`, {type: 'string', value: '\n'})
  testAst(`'"'`, {type: 'string', value: '"'})
  testAst(`"'"`, {type: 'string', value: '\''})
  testAst(`"a\\"b"`, {type: 'string', value: 'a"b'})
  testAst(`'a\\'b'`, {type: 'string', value: 'a\'b'})

  testAst(`alpha`, {type: 'identifier', label: 'alpha'})
  testAst(`$this-is_ID`, {type: 'identifier', label: '$this-is_ID'})
})

const fromTo = (from, to) => ({from: {col: from}, to: {col: to}})

const testRepr = (sourceCode, resultCode) => {
  assert(() => {
    const representation = represent(parse(sourceCode))
    const isEqual = representation === resultCode
    if (!isEqual) unitLogger(undefined, `\x1b[31mrepresentation\n${representation}\nis not equal to\n${resultCode}\x1b[0m`)
    return isEqual
  })
}

unittest('parsing unary expressions', () => {
  testRepr('(1)', '(1)')

  testRepr('not 1', 'not 1')
  testRepr('~1', '~1')
  testRepr('not ~-1', 'not (~(-1))')
})

unittest('parsing binary expressions', () => {
  testRepr('a + b', 'a + b')

  testRepr('a + b + c', '(a + b) + c')

  testRepr('a + b + c - d', '((a + b) + c) - d')

  testRepr('a * b / c mod d div e', '(((a * b) / c) mod d) div e')

  testRepr('a << b >> c >>> d', '((a << b) >> c) >>> d')

  testRepr('a << b >> c >>> d', '((a << b) >> c) >>> d')

  testRepr('a << b >> c >>> d', '((a << b) >> c) >>> d')

  testRepr('a == b != c == d', '((a == b) != c) == d')

  testRepr('a < b > c <= d >= e', '(((a < b) > c) <= d) >= e')

  testRepr('a & b & c', '(a & b) & c')
  testRepr('a | b | c', '(a | b) | c')
  testRepr('a ^ b ^ c', '(a ^ b) ^ c')
  testRepr('a & b | c ^ d', '((a & b) | c) ^ d')
  testRepr('a ^ b | c & d', 'a ^ (b | (c & d))')
  testRepr('a | b ^ c & d', '(a | b) ^ (c & d)')

  testRepr('a ** b ** c ** d', 'a ** (b ** (c ** d))')

  testRepr('1 and 2 and 3', '(1 and 2) and 3')
  testRepr('1 or 2 and 3', '1 or (2 and 3)')
  testRepr('1 and 2 or 3', '(1 and 2) or 3')

  testRepr('1 + 2 * 3', '1 + (2 * 3)')
  testRepr('(1 + 2) * 3)', '(1 + 2) * 3')
  testRepr('1 * 2 + 3', '(1 * 2) + 3')
  testRepr('1 * (2 + 3)', '1 * (2 + 3)')

  testRepr('1 or 2 and 3 ^ 4 | 5 & 6 < 7 == 8 << 9 + 10 * 11 ** 12', '1 or (2 and (3 ^ (4 | (5 & (6 < (7 == (8 << (9 + (10 * (11 ** 12))))))))))')
  testRepr('1 ** 2 * 3 + 4 << 5 == 6 < 7 & 8 | 9 ^ 10 and 11 or 12', '((((((((((1 ** 2) * 3) + 4) << 5) == 6) < 7) & 8) | 9) ^ 10) and 11) or 12')
  testRepr('1 & 2 and 3 + 4 or 5 ^ 6 < 7 ** 8 | 9 == 10 * 11 << 12', '((1 & 2) and (3 + 4)) or (5 ^ ((6 < (7 ** 8)) | (9 == ((10 * 11) << 12))))')
})

unittest('parsing functions', () => {
  testRepr('fun(1)', 'fun(1)')
  testRepr('fun(1, 2, "str")', "fun(1, 2, 'str')")
  testRepr('-fun(1)', '-fun(1)')
  testRepr('1 + -fun(1)', '1 + (-fun(1))')
  testRepr('(fun)()', '(fun)()')
  testRepr('fun()()()', 'fun()()()')
})

unittest('parsing assignment', () => {
  testRepr('a = 10', 'a = 10')
  testRepr('a, b = 10, 11', 'a, b = 10, 11')
  testRepr('a, b = b + "sun", fun()', "a, b = b + 'sun', fun()")
})

unittest('parsing dot access', () => {
  testRepr('a.b', 'a.b')
  testRepr("'10'.len", "'10'.len")
  testRepr('10.size', '10.size')
  testRepr('a.b.c', 'a.b.c')
  testRepr('a.field()', 'a.field()')
  testRepr('fun().field', 'fun().field')
  testRepr('fun.field()().field', 'fun.field()().field')
})

unittest('parsing index access', () => {
  testRepr('a[b]', 'a[b]')
  testRepr("'10'[0]", "'10'[0]")
  testRepr("'10'[0].length", "'10'[0].length")
  testRepr("'10'.length[fun()]", "'10'.length[fun()]")
  testRepr("'10'.fun()[fun()]", "'10'.fun()[fun()]")
})

unittest('parsing block', () => {
  testRepr(`\
a = 10
callMe(10 ** 2)`, `\
a = 10
callMe(10 ** 2)`)
})

unittest('parsing binary expressions ast', () => {
  assert(() => includes(parse('a + b + c'), {
    left: {
      left: {label: 'a', pos: fromTo(1, 2)},
      right: {label: 'b', pos: fromTo(5, 6)},
      pos: fromTo(1, 6)
    },
    right: {label: 'c', pos: fromTo(9, 10)},
    pos: fromTo(1, 10)
  }))

  assert(() => includes(parse('a ** b ** c'), {
    left: {label: 'a', pos: fromTo(1, 2)},
    right: {
      left: {label: 'b', pos: fromTo(6, 7)},
      right: {label: 'c', pos: fromTo(11, 12)},
      pos: fromTo(6, 12)
    },
    pos: fromTo(1, 12)
  }))
})
