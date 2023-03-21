import { no, ok } from 'src/opt'
import { Slice } from 'src/slice'
import { Str } from 'src/str'
import { assertEq, assertInc, unittest } from 'src/unittest'
import { Vec } from 'src/vec'
import { CodePtr } from './code-ptr'
import { SearchAny } from './searchers/search-any'
import { SearchChar } from './searchers/search-char'
import { SearchCharInRange } from './searchers/search-char-in-range'
import { SearchExceptChar } from './searchers/search-except-char'
import { SearchRepeat } from './searchers/search-repeat'
import { SearchSequence, SequenceFlag } from './searchers/search-sequence'
import { SearchStr } from './searchers/search-str'
import { TokenParser } from './token-parser'
import { TokenType } from './tokens'

export const indent = TokenParser.new(
    (from, to) => ({ type: TokenType.Indent, from, to, size: to.lenFrom(from) / 4 }),
    SearchRepeat.new(SearchStr.new(Str.from('    ')), Slice.new(ok(1), no()))
)
export const lineEnd = TokenParser.new(
    (from, to) => ({ type: TokenType.LineEnd, from, to }),
    SearchSequence.new(Vec.from([{
        searcher: SearchChar.new('\r'),
        flag: SequenceFlag.Optional
    }, {
        searcher: SearchChar.new('\n'),
        flag: SequenceFlag.None
    }]))
)

export const arrow = TokenParser.new((from, to) => ({ type: TokenType.Arrow, from, to }), SearchStr.new(Str.from('=>')))

export const equal = TokenParser.new((from, to) => ({ type: TokenType.Equal, from, to }), SearchStr.new(Str.from('==')))
export const notEqual = TokenParser.new((from, to) => ({ type: TokenType.NotEqual, from, to }), SearchStr.new(Str.from('!=')))
export const lessThanOrEqual = TokenParser.new((from, to) => ({ type: TokenType.LessThanOrEqual, from, to }), SearchStr.new(Str.from('<=')))
export const greaterThanOrEqual = TokenParser.new((from, to) => ({ type: TokenType.GreaterThanOrEqual, from, to }), SearchStr.new(Str.from('>=')))
export const lessThan = TokenParser.new((from, to) => ({ type: TokenType.LessThan, from, to }), SearchChar.new('<'))
export const greaterThan = TokenParser.new((from, to) => ({ type: TokenType.GreaterThan, from, to }), SearchChar.new('>'))

export const assign = TokenParser.new((from, to) => ({ type: TokenType.Assign, from, to }), SearchChar.new('='))

export const plus = TokenParser.new((from, to) => ({ type: TokenType.Plus, from, to }), SearchChar.new('+'))
export const minus = TokenParser.new((from, to) => ({ type: TokenType.Minus, from, to }), SearchChar.new('-'))
export const mul = TokenParser.new((from, to) => ({ type: TokenType.Mul, from, to }), SearchChar.new('*'))
export const div = TokenParser.new((from, to) => ({ type: TokenType.Div, from, to }), SearchChar.new('/'))
export const concat = TokenParser.new((from, to) => ({ type: TokenType.Concat, from, to }), SearchChar.new('~'))
export const or = TokenParser.new((from, to) => ({ type: TokenType.Or, from, to }), SearchStr.new(Str.from('or')))
export const and = TokenParser.new((from, to) => ({ type: TokenType.And, from, to }), SearchStr.new(Str.from('and')))

export const dot = TokenParser.new((from, to) => ({ type: TokenType.Dot, from, to }), SearchChar.new('.'))
export const exclamationMark = TokenParser.new((from, to) => ({ type: TokenType.ExclamationMark, from, to }), SearchChar.new('!'))
export const questionMark = TokenParser.new((from, to) => ({ type: TokenType.QuestionMark, from, to }), SearchChar.new('?'))
export const colon = TokenParser.new((from, to) => ({ type: TokenType.Colon, from, to }), SearchChar.new(':'))
export const at = TokenParser.new((from, to) => ({ type: TokenType.At, from, to }), SearchChar.new('@'))
export const sharp = TokenParser.new((from, to) => ({ type: TokenType.Sharp, from, to }), SearchChar.new('#'))

export const ampersand = TokenParser.new((from, to) => ({ type: TokenType.Ampersand, from, to }), SearchChar.new('&'))
export const verticalBar = TokenParser.new((from, to) => ({ type: TokenType.VerticalBar, from, to }), SearchChar.new('|'))
export const leftParenthesis = TokenParser.new((from, to) => ({ type: TokenType.LeftParenthesis, from, to }), SearchChar.new('('))
export const rightParenthesis = TokenParser.new((from, to) => ({ type: TokenType.RightParenthesis, from, to }), SearchChar.new(')'))
export const leftSquareBracket = TokenParser.new((from, to) => ({ type: TokenType.LeftSquareBracket, from, to }), SearchChar.new('['))
export const rightSquareBracket = TokenParser.new((from, to) => ({ type: TokenType.RightSquareBracket, from, to }), SearchChar.new(']'))
export const leftCurlyBrace = TokenParser.new((from, to) => ({ type: TokenType.LeftCurlyBrace, from, to }), SearchChar.new('{'))
export const rightCurlyBrace = TokenParser.new((from, to) => ({ type: TokenType.RightCurlyBrace, from, to }), SearchChar.new('}'))

export const trueP = TokenParser.new((from, to) => ({ type: TokenType.True, from, to }), SearchStr.new(Str.from('true')))
export const falseP = TokenParser.new((from, to) => ({ type: TokenType.False, from, to }), SearchStr.new(Str.from('false')))

const decimalDigit = SearchCharInRange.new('0', '9')
const lowerLetter = SearchCharInRange.new('a', 'z')
const upperLetter = SearchCharInRange.new('A', 'Z')
const dollar = SearchChar.new('$')
const dash = SearchChar.new('_')

export const indentifier = TokenParser.new(
    (from, to) => ({ type: TokenType.Identifier, from, to, name: to.textFrom(from) }),
    SearchSequence.new(Vec.from([{
        searcher: SearchAny.new(Vec.from([lowerLetter, upperLetter, dash, dollar])),
        flag: SequenceFlag.None
    }, {
        searcher: SearchRepeat.new(
            SearchAny.new(Vec.from([lowerLetter, upperLetter, dash, dollar, decimalDigit])),
            Slice.new(no(), no())
        ),
        flag: SequenceFlag.None
    }]))
)

const nonZeroDigit = SearchCharInRange.new('1', '9')

const decimalInteger = SearchSequence.new(Vec.from([{
    searcher: nonZeroDigit,
    flag: SequenceFlag.None,
}, {
    searcher: SearchRepeat.new(decimalDigit, Slice.new(no(), no())),
    flag: SequenceFlag.Optional,
}]))

const exponentPart = SearchSequence.new(Vec.from([{
    searcher: SearchAny.new(Vec.from([
        SearchChar.new('e'), 
        SearchChar.new('E')
    ])),
    flag: SequenceFlag.RequireEnd,
}, {
    searcher: SearchAny.new(Vec.from([
        SearchChar.new('+'), 
        SearchChar.new('-')
    ])),
    flag: SequenceFlag.Optional,
}, {
    searcher: SearchRepeat.new(decimalDigit, Slice.new(ok(1), no())),
    flag: SequenceFlag.End,
}]))

const decimalFractional = SearchAny.new(Vec.from([
    SearchSequence.new(Vec.from([{
        searcher: decimalInteger, flag: SequenceFlag.Optional,
    }, {
        searcher: SearchChar.new('.'), flag: SequenceFlag.RequireEnd,
    }, {
        searcher: SearchRepeat.new(decimalDigit, Slice.new(ok(1), no())), flag: SequenceFlag.End,
    }, {
        searcher: exponentPart, flag: SequenceFlag.Optional,
    }])),
    SearchSequence.new(Vec.from([{
        searcher: decimalInteger, flag: SequenceFlag.None,
    }, {
        searcher: exponentPart, flag: SequenceFlag.None,
    }])),
]))

export const decimalFractionalNumber = TokenParser.new(
    (from, to) => ({
        type: TokenType.DecimalFractionalNumber, from, to, value: parseFloat(to.textFrom(from).inner())
    }),
    decimalFractional
)

export const decimalIntegerNumber = TokenParser.new(
    (from, to) => ({
        type: TokenType.DecimalIntegerNumber, from, to, value: parseInt(to.textFrom(from).inner())
    }),
    decimalInteger
)

const escape = '\\'

const singleQuote: char = "'"

export const stringSingleQuote = TokenParser.new(
    (from, to) => ({
        type: TokenType.StringSingleQuote, from, to, text: to.textFrom(from)
            .slice((len) => Slice.new(ok(1), ok(len - 1)))
            .replace(/\\'/g, Str.from(singleQuote))
    }),
    SearchSequence.new(Vec.from([{
        searcher: SearchChar.new(singleQuote), flag: SequenceFlag.RequireEnd,
    }, {
        searcher: SearchRepeat.new(
            SearchExceptChar.new(singleQuote, escape),
            Slice.new(no(), no())
        ),
        flag: SequenceFlag.Optional,
    }, {
        searcher: SearchChar.new(singleQuote), flag: SequenceFlag.End,
    }]))
)

const doubleQuote: char = '"'

export const stringDoubleQuote = TokenParser.new(
    (from, to) => ({
        type: TokenType.StringDoubleQuote, from, to, text: to.textFrom(from)
            .slice((len) => Slice.new(ok(1), ok(len - 1)))
            .replace(/\\"/g, Str.from(doubleQuote))
    }),
    SearchSequence.new(Vec.from([{
        searcher: SearchChar.new(doubleQuote), flag: SequenceFlag.RequireEnd,
    }, {
        searcher: SearchRepeat.new(
            SearchExceptChar.new(doubleQuote, escape),
            Slice.new(no(), no())
        ),
        flag: SequenceFlag.Optional,
    }, {
        searcher: SearchChar.new(doubleQuote), flag: SequenceFlag.End,
    }]))
)

unittest(Str.from('token parsers'), () => {
    unittest(Str.from('indent'), () => {
        const [newCodePtr, result] = indent.parse(CodePtr.new(Str.from('          a')))
        assertEq(() => [newCodePtr.pos(), 8])
        assertInc(() => [result, ok({ type: TokenType.Indent, size: 2 })])
    })
})
