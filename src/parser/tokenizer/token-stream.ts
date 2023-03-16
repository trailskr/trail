import { isOk, no, ok, Opt } from "src/opt"
import { Slice } from "src/slice"
import { Str } from "src/str"
import { assertEq, unittest } from "src/unittest"
import { Vec } from "src/vec"
import { CodePtr } from "./code-ptr"
import { SearchChar } from "./searchers/search-char"
import { SearchRepeat } from "./searchers/search-repeat"
import { TokenParser } from "./token-parser"
import { arrow, div, indent, lineEnd, minus, mul, plus } from "./token-parsers"
import { TokenResult, TokenType } from "./tokens"

const whiteSpace = SearchRepeat.new(SearchChar.new(' '), Slice.new(no(), no()))

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
            ([ptr, foundToken], parser, _, stop) => {
                const [newPtr, result] = parser.parse(ptr)
                const newIsFound = foundToken || isOk(result) && result.val.type !== TokenType.Error
                if (newIsFound) {
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
            if (isOk(result)) return [new TokenStream(newPtr, false), result]
        }
        const [newPtr, lineEndResult] = lineEnd.parse(this.skipWhiteSpace())
        if (isOk(lineEndResult)) return [new TokenStream(newPtr, true), lineEndResult]
        return this.tryAny(
            newPtr,
            Vec.from([
                arrow,
                plus,
                minus,
                mul,
                div,
            ])
        )
    }
}

unittest(Str.from('TokenStrem'), () => {
    const tokenStream = TokenStream.new(Str.from('    => +   - /\n     '))
    const [tokenStream1, result1] = tokenStream.popLeft()
    assertEq(() => [result1, ok({ type: TokenType.Indent, size: 1 })])
    const [tokenStream2, result2] = tokenStream1.popLeft()
    assertEq(() => [result2, ok({ type: TokenType.Arrow })])
    const [tokenStream3, result3] = tokenStream2.popLeft()
    assertEq(() => [result3, ok({ type: TokenType.Plus })])
    const [tokenStream4, result4] = tokenStream3.popLeft()
    assertEq(() => [result4, ok({ type: TokenType.Minus })])
    const [tokenStream5, result5] = tokenStream4.popLeft()
    assertEq(() => [result5, ok({ type: TokenType.Div })])
    const [tokenStream6, result6] = tokenStream5.popLeft()
    assertEq(() => [result6, ok({ type: TokenType.LineEnd })])
    const [tokenStream7, result7] = tokenStream5.popLeft()
    assertEq(() => [result7, ok({ type: TokenType.Indent, size: 1 })])
})
