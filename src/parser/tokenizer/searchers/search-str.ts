import { CodePtr } from '../code-ptr'
import { isOk, no, ok, Opt } from 'src/opt'
import { TokenParser } from '../token-parser'
import { Token } from '../tokens'
import { Str } from 'src/str'

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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, str: Opt<Token>] {
        return this._str.fold(codePtr, (ptr) => {
            const [ptr, charOpt] = codePtr.next()
        })
      
        return isOk(strOpt) && strOpt.val === this._str
            ? [ptr, ok(this._token)]
            : [codePtr, no()]
    }
}
