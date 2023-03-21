import { isOk, no, ok, Opt } from 'src/opt'
import { Slice } from 'src/slice'
import { Str } from 'src/str'
import { assertEq, assertInc, unittest } from 'src/unittest'
import { Vec } from 'src/vec'
import { CodePtr } from './code-ptr'
import { SearchChar } from './searchers/search-char'
import { SearchRepeat } from './searchers/search-repeat'
import { TokenParser } from './token-parser'
import { ampersand, and, arrow, assign, at, colon, concat, decimalFractionalNumber, decimalIntegerNumber, div, dot, equal, exclamationMark, falseP, greaterThan, greaterThanOrEqual, indent, indentifier, leftCurlyBrace, leftParenthesis, leftSquareBracket, lessThan, lessThanOrEqual, lineEnd, minus, mul, notEqual, or, plus, questionMark, rightCurlyBrace, rightParenthesis, rightSquareBracket, sharp, stringDoubleQuote, stringSingleQuote, trueP, verticalBar } from './token-parsers'
import { TokenResult, TokenType } from './tokens'

const whiteSpace = SearchRepeat.new(SearchChar.new(' '), Slice.new(ok(1), no()))

export class TokenStream {
    private readonly _codePtr: CodePtr
    private readonly _isParsingIndent: bool

    private constructor(codePtr: CodePtr, isParsingIndent: bool = true) {
        this._codePtr = codePtr
        this._isParsingIndent = isParsingIndent
    }

    static new (code: Str): TokenStream {
        const codePtr = CodePtr.new(code)
        return new TokenStream(codePtr, true)
    }

    codePtr (): CodePtr {
        return this._codePtr
    }

    private skipWhiteSpace(): CodePtr {
        const [newPtr, _] = whiteSpace.parse(this._codePtr)
        return newPtr
    }

    private tryAny(codePtr: CodePtr, parsers: Vec<TokenParser>): [TokenStream, Opt<TokenResult, void>] {
        const [newPtr, foundToken] = parsers.fold(
            [codePtr, no()] as [CodePtr, Opt<TokenResult>],
            ([ptr, _accResult], parser, _, stop) => {
                const [newPtr, result] = parser.parse(ptr)
                if (isOk(result)) {
                    stop()
                    return [newPtr, result]
                }
                return [codePtr, no() as Opt<TokenResult>]
            }
        )
      
        return isOk(foundToken)
            ? [new TokenStream(newPtr, false), foundToken]
            : [new TokenStream(codePtr, false), no()]
    }

    popLeft(): [TokenStream, Opt<TokenResult>] {
        if (this._isParsingIndent) {
            const [newPtr, result] = indent.parse(this._codePtr)
            if (isOk(result)) {
                const [newPtr1, optionalLineEnd] = lineEnd.parse(this._codePtr)
                // skip indent if lineEnd after it
                if (isOk(optionalLineEnd)) {
                    return [new TokenStream(newPtr1, false), optionalLineEnd]
                }
                return [new TokenStream(newPtr, false), result]
            }
        }
        const [newPtr, lineEndResult] = lineEnd.parse(this.skipWhiteSpace())
        if (isOk(lineEndResult)) return [new TokenStream(newPtr, true), lineEndResult]
        return this.tryAny(
            newPtr,
            Vec.from([
                arrow,
                equal,
                notEqual,
                lessThanOrEqual,
                greaterThanOrEqual,
                lessThan,
                greaterThan,
                assign,
                plus,
                minus,
                mul,
                div,
                concat,
                or,
                and,
                dot,
                exclamationMark,
                questionMark,
                colon,
                at,
                sharp,
                ampersand,
                verticalBar,
                leftParenthesis,
                rightParenthesis,
                leftSquareBracket,
                rightSquareBracket,
                leftCurlyBrace,
                rightCurlyBrace,
                trueP,
                falseP,
                indentifier,
                decimalIntegerNumber,
                decimalFractionalNumber,
                stringSingleQuote,
                stringDoubleQuote,
            ])
        )
    }
}

unittest(Str.from('TokenStream'), () => {
    const tokenStream = TokenStream.new(Str.from('    => "\\"hello\\""   - hello (5.5 /\n     \n    true'))
    const [tokenStream1, result1] = tokenStream.popLeft()
    assertInc(() => [result1, ok({ type: TokenType.Indent, size: 1 })])
    const [tokenStream2, result2] = tokenStream1.popLeft()
    assertInc(() => [result2, ok({ type: TokenType.Arrow })])
    const [tokenStream3, result3] = tokenStream2.popLeft()
    assertInc(() => [result3, ok({ type: TokenType.StringDoubleQuote, text: Str.from('"hello"') })])
    // const [tokenStream4, result4] = tokenStream3.popLeft()
    // assertInc(() => [result4, ok({ type: TokenType.Minus })])
    // const [tokenStream5, result5] = tokenStream4.popLeft()
    // assertInc(() => [result5, ok({ type: TokenType.Div })])
    // const [tokenStream6, result6] = tokenStream5.popLeft()
    // assertInc(() => [result6, ok({ type: TokenType.LineEnd })])
    // const [tokenStream7, result7] = tokenStream6.popLeft()
    // assertInc(() => [result7, ok({ type: TokenType.Indent, size: 1 })])
    // assertInc(() => [tokenStream7.codePtr().row(), 2])
    // assertInc(() => [tokenStream7.codePtr().col(), 5])
    // const [tokenStream8, result8] = tokenStream7.popLeft()
    // assertInc(() => [result8, ok({ type: TokenType.Indent })])
    // const [_, result9] = tokenStream8.popLeft()
    // assertInc(() => [result9, ok({ type: TokenType.True })])
})
