import { no, ok, Opt } from 'src/opt'
import { CharStream } from './char-stream'
import { Token, TokenResult, TokenType } from './tokens'
import { Str } from 'src/str'
import { Searcher, SearchResult } from '../searcher/searcher'

export class TokenParser {
    private readonly _tokenFn: (fromCharStream: CharStream, toCharStream: CharStream) => Token
    private readonly _searcher: Searcher

    constructor(tokenFn: (fromCharStream: CharStream, toCharStream: CharStream) => Token, searcher: Searcher) {
        this._tokenFn = tokenFn
        this._searcher = searcher
    }

    static new (tokenFn: (fromCharStream: CharStream, toCharStream: CharStream) => Token, searcher: Searcher): TokenParser {
        return new TokenParser(tokenFn, searcher)
    }

    parse(charStream: CharStream): [newCharStream: CharStream, token: Opt<TokenResult>] {
        const [newCharStream, result] = this._searcher.parse(charStream)
        return result === SearchResult.NotEnded
            ? [newCharStream, ok({ type: TokenType.Error, msg: Str.from('expected end of token') })]
            : result === SearchResult.Found
                ? [newCharStream, ok(this._tokenFn(charStream, newCharStream))]
                : [charStream, no()]
    }
}

