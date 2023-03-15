import { CodePtr } from '../code-ptr'
import { isOk, no, ok, Opt } from 'src/opt'
import { TokenParser } from '../token-parser'
import { Token } from '../tokens'

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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, char: Opt<Token>] {
        const [ptr, charOpt] = codePtr.next()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [ptr, ok(this._token)]
            : [codePtr, no()]
    }
}
