import { CodePtr } from '../code-ptr'
import { isOk, no, ok, Opt } from 'src/opt'
import { TokenParser } from '../token-parser'
import { Token, TokenType } from '../tokens'
import { Str } from 'src/str'
import { assert, assertEq, unittest } from 'src/unittest'

export class SearchChar implements TokenParser {
    private readonly _token: Token
    private readonly _char: char

    constructor (token: Token, char: char) {
        this._token = token
        this._char = char
    }
    
    static new (token: Token, char: char): SearchChar {
        return new SearchChar(token, char)
    }

    token(): Token {
        return this._token
    }

    char(): char {
        return this._char
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, token: Opt<Token>] {
        const [ptr, charOpt] = codePtr.next()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [ptr, ok(this._token)]
            : [codePtr, no()]
    }
}

unittest(Str.from('SearchChar'), () => {
    const arrow = SearchChar.new({ type: TokenType.Plus }, '+')
    const codePtr1 = CodePtr.new(Str.from('+'))
    const [newPtr1, tokenOpt] = arrow.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 1])
    assert(() => isOk(tokenOpt) && tokenOpt.val.type === TokenType.Plus)
})