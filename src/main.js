import {charInRange, charRepeat, char, exceptChar, string} from './parser/searchers.js'
import {any, sequenceToString, repeatToString, sequence, repeat} from './parser/combiners.js'
import {makeLoggableParserWrapper} from './parser/makeLoggableParserWrapper.js'
import {optional, skip, transform, transformResult} from './parser/parserBase.js'
import {unitLogger} from './unittests.js'

const loggable = makeLoggableParserWrapper(unitLogger, '. ')

const WS = skip(charRepeat(' ', 1))
const LE = skip(repeatToString(sequenceToString(charRepeat(' '), any(char('\r'), char('\n'))), 1))
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
  LESS_THAN_OR_EQUAL_TO,
  GREATER_THAN_OR_EQUAL_TO,
  LESS_THAN,
  GREATER_THAN,
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

const pParensExpression = loggable('parens-expression', transform(
  sequence(LEFT_PAREN, pExpression, RIGHT_PAREN),
  ([content], pos) => ({type: 'parensExpression', content, pos})
))

const pAtom = loggable('atom', any(pLiteral, pIdentifier, pParensExpression))

const pIdentifierSeries = loggable('identifier-series', series(pIdentifier, sequence(char(','), WS)))
const pExpressionSeries = loggable('expression-series', series(pExpression, sequence(char(','), WS)))

const pAssignment = loggable('assignment', any(
  transform(
    sequence(
      pIdentifierSeries,
      skip(loggable('equality', sequence(
        WS,
        char('='),
        WS
      ))),
      pExpressionSeries
    ),
    ([identifiers, values], pos) => {
      return {type: 'assignment', identifiers, values, pos}
    }
  ),
  pAtom
))

const pFunctionCall = loggable('function-call', any(
  transform(
    sequence(
      loggable('function-name', any(
        pIdentifier,
        pParensExpression
      )),
      loggable('function-arguments', sequence(
        skip(char('(')),
        loggable('arguments', pExpressionSeries),
        skip(char(')'))
      ))
    ),
    ([identifier, [args]], pos) => ({type: 'functionCall', identifier, args, pos})
  ),
  pAssignment
))

const pPrefixOperator = loggable('prefix-operator', any(
  transform(
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
        ),
        1
      ),
      pFunctionCall
    ),
    ([ops, right], pos) => {
      return ops.reduceRight((right, op) => {
        return {type: 'prefixOperator', op, right, pos}
      }, right)
    }
  ),
  pFunctionCall
))

const operators = [
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
]

const opPrecedence = operators.reduce((res, ops, ind, arr) => {
  return {
    ...res,
    ...ops.reduce((res, op) => {
      return {...res, [op]: arr.length - ind}
    }, {})
  }
}, {})

const Associativity = {
  left: 0,
  right: 1
}

const opAssociativity = (op) => op === '**' ? Associativity.right : Associativity.left

const pBinaryRight = (ptrLeft, left, precedence = 0) => {
  const [ptrWs, ws] = WS(ptrLeft)
  if (!ws) return [ptrLeft, left]
  const [ptrOp, op] = BINARY_OPERATOR(ptrWs)
  if (!op) return [ptrLeft, left]

  const newPrecedence = opPrecedence[op]
  if (newPrecedence > precedence) {
    const [ptrWs2, ws2] = WS(ptrOp)
    if (!ws2) return [ptrLeft, left]
    const [newLeftPtr, newLeft] = pPrefixOperator(ptrWs2)
    if (!newLeft) return [ptrLeft, left]

    const isLeftAssociativity = opAssociativity(op) === Associativity.left

    const [rightPtr, right] = pBinaryRight(newLeftPtr, newLeft, newPrecedence - (isLeftAssociativity ? 0 : 1))

    return pBinaryRight(rightPtr, {
      type: 'binaryOperator',
      op,
      left,
      right,
      pos: {from: left.pos.from, to: right.pos.to}
    }, precedence)
  }
  return [ptrLeft, left]
}

const pBinaryOperator = loggable('binary-operator', (codePointer) => {
  const [ptrLeft, left] = pPrefixOperator(codePointer)
  return pBinaryRight(ptrLeft, left, 0)
})

pExpression.parsers.push(pBinaryOperator)

export const pBlock = loggable('block-code', transform(
  series(pExpression, loggable('line end', LE)),
  (expressions, pos) => {
    return expressions.length === 1
      ? expressions[0]
      : {type: 'block', expressions, pos}
  }
))