import {inspect} from 'util'
import {CodePointer} from './CodePointer.js'
import {charInRange, charRepeat, char, exceptChar, string} from './searchers.js'
import {any, sequenceToString, repeatToString, sequence, repeat} from './combiners.js'
import {logger, makeLoggable} from './logging.js'
import {optional, skip, transform, transformResult} from './parserBase.js'
import {represent} from './represent.js'
import {assert, unittest} from './unittests.js'
import {includes} from './utils.js'

const log = logger()
const loggable = makeLoggable(log)

const LE = skip(repeatToString(any(char('\r'), char('\n')), 1))
const WS = skip(charRepeat(' ', 1))
const UPPER = charInRange('A', 'Z')
const LOWER = charInRange('a', 'z')

const DECIMAL_DIGIT = charInRange('0', '9')
const ZERO_DIGIT = char('0')
const NON_ZERO_DECIMAL_DIGIT = charInRange('1', '9')

const DECIMAL_INTEGER = any(
  ZERO_DIGIT,
  optional(
    sequenceToString(
      NON_ZERO_DECIMAL_DIGIT,
      repeatToString(DECIMAL_DIGIT)
    )
  )
)

const EXPONENT_PART = sequenceToString(
  any(char('e'), char('E')),
  optional(
    any(char('+'), char('-'))
  ),
  repeatToString(DECIMAL_DIGIT)
)

const DECIMAL_FRACTIONAL = any(
  sequenceToString(
    DECIMAL_INTEGER,
    char('.'),
    repeatToString(DECIMAL_DIGIT),
    optional(EXPONENT_PART)
  ),
  sequenceToString(
    char('.'),
    repeatToString(DECIMAL_DIGIT, 1),
    optional(EXPONENT_PART)
  ),
  sequenceToString(
    DECIMAL_INTEGER,
    EXPONENT_PART
  )
)

const HYPHEN = char('-')
const DASH = char('_')
const DOLLAR = char('$')
const IDENTIFIER_FIRST_LETTER = any(UPPER, LOWER, DASH, DOLLAR)
const IDENTIFIER_REST_LETTER = any(UPPER, LOWER, HYPHEN, DASH, DOLLAR, DECIMAL_DIGIT)

const TRUE = string('true')
const FALSE = string('false')

const POW = string('**')

const PLUS = char('+')
const MINUS = char('-')

const MUL = char('*')
const DIV = char('/')
const MODULO = string('mod')
const DIV_FLOOR = string('div')

const SHIFT_LEFT_ZERO = string('<<')
const SHIFT_RIGHT_ZERO = string('>>>')
const SHIFT_RIGHT_SIGNED = string('>>')

const EQUAL = string('==')
const NOT_EQUAL = string('!=')

const LESS_THAN = char('<')
const GREATER_THAN = char('>')
const LESS_THAN_OR_EQUAL_TO = string('<=')
const GREATER_THAN_OR_EQUAL_TO = string('>=')

const BITWISE_AND = char('&')
const BITWISE_OR = char('|')
const BITWISE_XOR = char('^')

const LOGICAL_AND = string('and')
const LOGICAL_OR = string('or')

const BINARY_OPERATOR = any(
  POW,
  PLUS,
  MINUS,
  MUL,
  DIV,
  MODULO,
  DIV_FLOOR,
  SHIFT_LEFT_ZERO,
  SHIFT_RIGHT_ZERO,
  SHIFT_RIGHT_SIGNED,
  EQUAL,
  NOT_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  LESS_THAN_OR_EQUAL_TO,
  GREATER_THAN_OR_EQUAL_TO,
  BITWISE_AND,
  BITWISE_OR,
  BITWISE_XOR,
  LOGICAL_AND,
  LOGICAL_OR
)

const BITWISE_NOT = char('~')

const NOT = string('not')

const LEFT_PAREN = skip(char('('))
const RIGHT_PAREN = skip(char(')'))

const series = (parser, divider) => transform(
  optional(
    transform(
      sequence(
        parser,
        loggable('repeat', repeat(
          transform(
            sequence(divider.skip ? divider : skip(divider), parser),
            ([first]) => first
          )
        ))
      ),
      ([first, rest]) => [first, ...rest]
    )
  ),
  (args) => args || []
)

const STRING_SINGLE_QUOTE = sequenceToString(
  skip(char('\'')),
  transform(
    repeatToString(exceptChar('\'', '\\')),
    (str) => str.replace(/\\'/g, '\'')
  ),
  skip(char('\''))
)
const STRING_DOUBLE_QUOTE = sequenceToString(
  skip(char('"')),
  transform(
    repeatToString(exceptChar('"', '\\')),
    (str) => str.replace(/\\"/g, '"')
  ),
  skip(char('"'))
)

const pExpression = loggable('expression', any())

const pIdentifier = loggable('identifier', transform(
  sequenceToString(
    IDENTIFIER_FIRST_LETTER,
    repeatToString(IDENTIFIER_REST_LETTER)
  ),
  (res, pos) => ({type: 'identifier', label: res, pos})
))

const pBoolean = loggable('boolean', transform(
  any(TRUE, FALSE),
  (res, pos) => ({type: 'boolean', value: res === 'true', pos})
))

const pInteger = loggable('integer', transform(
  DECIMAL_INTEGER,
  (res, pos) => ({type: 'integer', value: +res, pos})
))

const pFractional = loggable('fractional', transform(
  DECIMAL_FRACTIONAL,
  (res, pos) => ({type: 'fractional', value: +res, pos})
))

const pString = loggable('string', transform(
  any(STRING_SINGLE_QUOTE, STRING_DOUBLE_QUOTE),
  (res, pos) => ({type: 'string', value: res, pos})
))

const pLiteral = loggable('literal', any(pBoolean, pFractional, pInteger, pString))

const pParensExpression = loggable('parens expression', transform(
  sequence(LEFT_PAREN, pExpression, RIGHT_PAREN),
  ([content], pos) => ({type: 'parensExpression', content, pos})
))

const pAtom = loggable('atom', any(pLiteral, pIdentifier, pParensExpression))

const pAssignment = loggable('assignment', transform(
  sequence(
    pAtom,
    optional(
      sequence(
        loggable('equality', skip(char(':'))),
        WS,
        pExpression
      )
    )
  ),
  ([identifier, values], pos) => {
    return values === undefined
      ? identifier
      : values.reduceRight((identifier, value) => {
        return {type: 'assignment', identifier, value, pos}
      }, identifier)
  }
))

const pFunctionCall = loggable('function call', transform(
  sequence(
    pAssignment,
    optional(
      sequence(
        skip(char('(')),
        loggable('arguments', series(pExpression, sequence(char(','), WS))),
        skip(char(')'))
      )
    )
  ),
  ([identifier, args], pos) => {
    return args === undefined
      ? identifier
      : {type: 'functionCall', identifier, args: args[0], pos}
  }
))

const pPrefixOperator = loggable('prefix operator', transform(
  sequence(
    repeat(
      any(
        PLUS,
        MINUS,
        BITWISE_NOT,
        transformResult(
          sequence(NOT, WS),
          ([op]) => op
        )
      )
    ),
    pFunctionCall
  ),
  ([ops, right], pos) => {
    return ops.length === 0
      ? right
      : ops.reduceRight((right, op) => {
        return {type: 'prefixOperator', op, right, pos}
      }, right)
  }
))

// const Associativity = {
//   left: 0,
//   right: 1
// }
//
// const associativityBinaryTransforms = [
//   ([left, repeat]) => {
//     return repeat.length === 0
//       ? left
//       : repeat.reduce((left, [op, right]) => {
//         return {
//           type: 'binaryOperator',
//           op,
//           left,
//           right,
//           pos: {from: left.pos.from, to: right.pos.to}
//         }
//       }, left)
//   },
//   ([left, repeat]) => {
//     const recursive = (left, index) => {
//       if (index === repeat.length) return left
//
//       const [op, next] = repeat[index]
//       const right = recursive(next, index + 1)
//       return {
//         type: 'binaryOperator',
//         op,
//         left,
//         right,
//         pos: {from: left.pos.from, to: right.pos.to}
//       }
//     }
//
//     return recursive(left, 0)
//   }
// ]

// const makeBinary = (higherPriorityParser, operatorsParser, associativity = Associativity.left) => {
//   return transform(
//     sequence(
//       loggable('left argument', higherPriorityParser),
//       repeat(
//         sequence(
//           WS,
//           loggable('operator', operatorsParser),
//           WS,
//           higherPriorityParser
//         )
//       )
//     ),
//     associativityBinaryTransforms[associativity]
//   )
// }

// const pPowerOperator = loggable('power operator', makeBinary(pPrefixOperator, POW, Associativity.right))
// const pMultiplicativeOperator = loggable('multiplicative operator', makeBinary(pPowerOperator, any(MUL, DIV, MODULO, DIV_FLOOR)))
// const pAdditiveOperator = loggable('additive operator', makeBinary(pMultiplicativeOperator, any(PLUS, MINUS)))
//
// const pBitShiftOperator = loggable('bit shift operator', makeBinary(pAdditiveOperator, any(SHIFT_LEFT_ZERO, SHIFT_RIGHT_ZERO, SHIFT_RIGHT_SIGNED)))
// const pEqualityOperator = loggable('equality operator', makeBinary(pBitShiftOperator, any(EQUAL, NOT_EQUAL)))
// const pComparisonOperator = loggable('comparison operator', makeBinary(pEqualityOperator, any(LESS_THAN_OR_EQUAL_TO, GREATER_THAN_OR_EQUAL_TO, LESS_THAN, GREATER_THAN)))
//
// const pBitwiseAndOperator = loggable('bitwise and operator', makeBinary(pComparisonOperator, BITWISE_AND))
// const pBitwiseOrOperator = loggable('bitwise or operator', makeBinary(pBitwiseAndOperator, BITWISE_OR))
// const pBitwiseXorOperator = loggable('bitwise xor operator', makeBinary(pBitwiseOrOperator, BITWISE_XOR))
//
// const pLogicalAndOperator = loggable('logical and operator', makeBinary(pBitwiseXorOperator, LOGICAL_AND))
// const pLogicalOrOperator = loggable('logical or operator', makeBinary(pLogicalAndOperator, LOGICAL_OR))

const opPrecedence = [
  ['**'],
  ['*', '/', 'mod', 'div'],
  ['+', '-'],
  ['<<', '>>', '>>>'],
  ['==', '!='],
  ['<', '>', '<=', '>='],
  ['&'],
  ['|'],
  ['^'],
  ['and'],
  ['or']
].reduce((res, ops, ind, arr) => {
  return {
    ...res,
    ...ops.reduce((res, op) => {
      return {...res, [op]: arr.length - ind}
    }, {})
  }
}, {})

const pBinaryOperator = loggable('binary operator', (codePointer) => {
  const recursive = (ptrLeft, left, precedence = 0) => {
    const [ptrWs, ws] = WS(ptrLeft)
    if (!ws) {
      return [ptrLeft, left]
    }
    const [ptrOp, op] = BINARY_OPERATOR(ptrWs)
    if (!op) {
      return [ptrLeft, left]
    }

    const prec = opPrecedence[op]
    if (prec > precedence) {
      const [ptrWs2, ws2] = WS(ptrOp)
      if (!ws2) {
        return [ptrLeft, left]
      }
      const [newLeftPtr, newLeft] = pPrefixOperator(ptrWs2)
      if (!newLeft) {
        return [ptrLeft, left]
      }

      const [rightPtr, right] = recursive(newLeftPtr, newLeft, prec)

      return recursive(rightPtr, {
        type: 'binaryOperator',
        op,
        left,
        right,
        pos: {from: left.pos.from, to: right.pos.to}
      }, precedence)
    }
    return [ptrLeft, left]
  }
  const [ptrLeft, left] = pPrefixOperator(codePointer)

  return recursive(ptrLeft, left, 0)
})
//
// const ast = pBinaryOperator(CodePointer('a + b / c * 10'))
// console.log(inspect(ast, {depth: Infinity}))
//
// process.exit(0)

pExpression.parsers.push(pBinaryOperator)

const pBlock = loggable('block code', transform(
  series(pExpression, loggable('line end', LE)),
  (expressions, pos) => {
    return expressions.length === 1
      ? expressions[0]
      : {type: 'block', expressions, pos}
  }
))

const parse = (code) => pBlock(CodePointer(code))[1]

// const testAst = (sourceCode, resultAst) => {
//   assert(includes(parse(sourceCode), resultAst))
// }

// unittest(() => {
//   testAst('true', {type: 'boolean', value: true, pos: {from: {col: 1}, to: {col: 5}}})
//   testAst('false', {type: 'boolean', value: false})
//
//   testAst('1', {type: 'integer', value: 1})
//   testAst('1050', {type: 'integer', value: 1050})
//
//   testAst('.1', {type: 'fractional', value: 0.1})
//   testAst('1e3', {type: 'fractional', value: 1000})
//   testAst('0.5e-1', {type: 'fractional', value: 0.05})
//
//   testAst(`'string'`, {type: 'string', value: 'string', pos: {from: {col: 1}, to: {col: 9}}})
//   testAst(`"string"`, {type: 'string', value: 'string'})
//   testAst(`'\n'`, {type: 'string', value: '\n'})
//   testAst(`'"'`, {type: 'string', value: '"'})
//   testAst(`"'"`, {type: 'string', value: '\''})
//   testAst(`"a\\"b"`, {type: 'string', value: 'a"b'})
//   testAst(`'a\\'b'`, {type: 'string', value: 'a\'b'})
//
//   testAst(`alpha`, {type: 'identifier', label: 'alpha'})
//   testAst(`$this-is_ID`, {type: 'identifier', label: '$this-is_ID'})
// })

const testRepr = (sourceCode, resultCode) => {
  assert(resultCode === represent(parse(sourceCode)))
}

const fromTo = (from, to) => ({from: {col: from}, to: {col: to}})

unittest(() => {
  assert(includes(parse('a + b + c'), {
    left: {
      left: {label: 'a', pos: fromTo(1, 2)},
      right: {label: 'b', pos: fromTo(5, 6)},
      pos: fromTo(1, 6)
    },
    right: {label: 'c', pos: fromTo(9, 10)},
    pos: fromTo(1, 10)
  }))

  assert(includes(parse('a ** b ** c'), {
    left: {label: 'a', pos: fromTo(1, 2)},
    right: {
      left: {label: 'b', pos: fromTo(6, 7)},
      right: {label: 'c', pos: fromTo(11, 12)},
      pos: fromTo(6, 12)
    },
    pos: fromTo(1, 12)
  }))
})

unittest(() => {
  testRepr('(1)', '(1)')

  testRepr('not 1', 'not 1')
  testRepr('~1', '~1')
  testRepr('not ~-1', 'not (~(-1))')

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

const code = `\
a: 10 + 5 - 10 + 20
print('hello')`

let p = CodePointer(code)
let res
console.time('parsing time')
;[p, res] = pBlock(p)
console.log('')
console.timeEnd('parsing time')

if (res) {
  console.log('')
  console.log(inspect(res, {depth: Infinity}))
  console.log('')
  console.log(represent(res))
}
