import {inspect} from 'util'
import {CodePointer} from './CodePointer.js'
import {charInRange, charRepeat, char, exceptChar, string} from './searchers.js'
import {any, sequenceToString, repeatToString, sequence, repeat} from './combiners.js'
import {logger, makeLoggable} from './logging.js'
import {optional, skip, transform, transformResult} from './parserBase.js'
import {represent} from './represent.js'

const log = logger()
const loggable = makeLoggable(log)

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

const DASH = char('_')
const DOLLAR = char('$')
const IDENTIFIER_FIRST_LETTER = any(UPPER, LOWER, DASH, DOLLAR)
const IDENTIFIER_REST_LETTER = any(UPPER, LOWER, DASH, DOLLAR, DECIMAL_DIGIT)

const TRUE = string('true')
const FALSE = string('false')

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

const BITWISE_NOT = char('~')

const NOT = string('not')

const LEFT_PAREN = skip(char('('))
const RIGHT_PAREN = skip(char(')'))

const series = (parser, divider = char(',')) => transform(
  optional(
    transform(
      sequence(
        parser,
        repeat(
          transform(
            sequence(skip(divider), WS, parser),
            ([first]) => first
          )
        )
      ),
      ([first, rest]) => [first, ...rest]
    )
  ),
  (args) => args || []
)

const STRING_SINGLE_QUOTE = sequenceToString(
  skip(char("'")),
  transform(
    repeatToString(exceptChar("'", '\\')),
    (str) => str.replace(/\\'/g, "'")
  ),
  skip(char("'"))
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
        loggable('arguments', series(pExpression)),
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

const Associativity = {
  left: 0,
  right: 1
}

const associativityBinaryTransforms = [
  ([left, repeat], pos) => {
    return repeat.length === 0
      ? left
      : repeat.reduce((left, [op, right]) => {
        return {type: 'binaryOperator', op, left, right, pos}
      }, left)
  },
  ([right, repeat], pos) => {
    return repeat.length === 0
      ? right
      : repeat.reduceRight((right, [op, left]) => {
        return {type: 'binaryOperator', op, right, left, pos}
      }, right)
  }
]

const makeBinary = (higherPriorityParser, operatorsParser, associativity = Associativity.left) => {
  return transform(
    sequence(
      loggable('left argument', higherPriorityParser),
      repeat(
        sequence(
          WS,
          loggable('operator', operatorsParser),
          WS,
          higherPriorityParser
        )
      )
    ),
    associativityBinaryTransforms[associativity]
  )
}

const pBinaryOperator = (() => {
  const pMultiplicativeOperator = loggable('multiplicative operator', makeBinary(pPrefixOperator, any(MUL, DIV, MODULO, DIV_FLOOR)))
  const pAdditiveOperator = loggable('additive operator', makeBinary(pMultiplicativeOperator, any(PLUS, MINUS)))

  const pBitShiftOperator = loggable('bit shift operator', makeBinary(pAdditiveOperator, any(SHIFT_LEFT_ZERO, SHIFT_RIGHT_ZERO, SHIFT_RIGHT_SIGNED)))
  const pEqualityOperator = loggable('equality operator', makeBinary(pBitShiftOperator, any(EQUAL, NOT_EQUAL)))
  const pComparisonOperator = loggable('comparison operator', makeBinary(pEqualityOperator, any(LESS_THAN, GREATER_THAN, LESS_THAN_OR_EQUAL_TO, GREATER_THAN_OR_EQUAL_TO)))

  const pBitwiseAndOperator = loggable('bitwise and operator', makeBinary(pComparisonOperator, BITWISE_AND))
  const pBitwiseOrOperator = loggable('bitwise or operator', makeBinary(pBitwiseAndOperator, BITWISE_OR))
  const pBitwiseXorOperator = loggable('bitwise xor operator', makeBinary(pBitwiseOrOperator, BITWISE_XOR))

  const pLogicalAndOperator = loggable('logical and operator', makeBinary(pBitwiseXorOperator, LOGICAL_AND))
  const pLogicalOrOperator = loggable('logical or operator', makeBinary(pLogicalAndOperator, LOGICAL_OR))

  return pLogicalOrOperator
})()

pExpression.parsers.push(pBinaryOperator)

const code = `b: a(1, 2, 3 + 10) or false * 5`

let p = CodePointer(code)
let res
console.time('parsing time')
;[p, res] = pExpression(p)
console.log('')
console.timeEnd('parsing time')

if (res) {
  console.log('')
  console.log(inspect(res, {depth: Infinity}))
  console.log('')
  console.log(represent(res))
}
