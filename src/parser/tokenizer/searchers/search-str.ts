import { CodePtr } from '../code-ptr'
import { isNo, isOk, no, ok, Opt } from 'src/opt'
import { TokenParser } from '../token-parser'
import { TokenType, Token } from '../tokens'
import { Str } from 'src/str'
import { assert, assertEq, assertInc, unittest } from 'src/unittest'

export class SearchStr implements TokenParser {
    private readonly _token: Token
    private readonly _str: Str

    constructor (token: Token, str: Str) {
        this._token = token
        this._str = str
    }
    
    static new (token: Token, str: Str): SearchStr {
        return new SearchStr(token, str)
    }

    token(): Token {
        return this._token
    }

    str(): Str {
        return this._str
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, token: Opt<Token>] {
        const newPtr = this._str.fold(codePtr, (ptr, strChar, _, stop) => {
            const [newPtr, charOpt] = ptr.next()
            if (isNo(charOpt) || strChar !== charOpt.val) {
                stop()
                return codePtr
            }
            return newPtr
        })
      
        return newPtr != codePtr
            ? [newPtr, ok(this._token)]
            : [codePtr, no()]
    }
}

unittest(Str.from('SearchStr'), () => {
    const arrow = SearchStr.new({ type: TokenType.LineEnd }, Str.from('\r\n'))
    const codePtr1 = CodePtr.new(Str.from('\r\n'))
    const [newPtr1, tokenOpt] = arrow.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 2])
    assert(() => isOk(tokenOpt) && tokenOpt.val.type === TokenType.LineEnd)
})