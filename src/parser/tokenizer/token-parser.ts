import { no, ok, Opt } from 'src/opt'
import { CharStream } from './char-stream'
import { Token, TokenResult, TokenType } from './tokens'
import { Str } from 'src/str'
import { Searcher, SearchResult } from './searcher'

export class TokenParser {
    private readonly _tokenFn: (oldCharStream: CharStream, newCharStream: CharStream) => Token
    private readonly _searcher: Searcher

    constructor(tokenFn: (oldCharStream: CharStream, newCharStream: CharStream) => Token, searcher: Searcher) {
        this._tokenFn = tokenFn
        this._searcher = searcher
    }

    static new (tokenFn: (oldCharStream: CharStream, newCharStream: CharStream) => Token, searcher: Searcher): TokenParser {
        return new TokenParser(tokenFn, searcher)
    }

    parse(charStream: CharStream): [newCharStream: CharStream, token: Opt<TokenResult>] {
        const [newPtr, result] = this._searcher.parse(charStream)
        return result === SearchResult.NotEnded
            ? [newPtr, ok({ type: TokenType.Error, msg: Str.from('expected end of token') })]
            : result === SearchResult.Found
                ? [newPtr, ok(this._tokenFn(charStream, newPtr))]
                : [charStream, no()]
    }
}

