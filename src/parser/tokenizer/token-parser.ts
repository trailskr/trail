import { no, ok, Opt } from 'src/opt'
import { CodePtr } from './code-ptr'
import { Token, TokenResult, TokenType } from './tokens'
import { Str } from 'src/str'
import { Searcher, SearchResult } from './searcher'

export class TokenParser {
    private readonly _tokenFn: (oldCodePtr: CodePtr, newCodePtr: CodePtr) => Token
    private readonly _searcher: Searcher

    constructor(tokenFn: (oldCodePtr: CodePtr, newCodePtr: CodePtr) => Token, searcher: Searcher) {
        this._tokenFn = tokenFn
        this._searcher = searcher
    }

    static new (tokenFn: (oldCodePtr: CodePtr, newCodePtr: CodePtr) => Token, searcher: Searcher): TokenParser {
        return new TokenParser(tokenFn, searcher)
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, token: Opt<TokenResult>] {
        const [newPtr, result] = this._searcher.parse(codePtr)
        return result === SearchResult.NotEnded
            ? [newPtr, ok({ type: TokenType.Error, msg: Str.from('expected end of token') })]
            : result === SearchResult.Found
                ? [newPtr, ok(this._tokenFn(codePtr, newPtr))]
                : [codePtr, no()]
    }
}

