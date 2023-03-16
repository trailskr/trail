import { no, ok, Opt } from 'src/opt'
import { SearchChar } from './searchers/search-char'
import { CodePtr } from './code-ptr'
import { Token, TokenResult, TokenType } from './tokens'
import { SearchStr } from './searchers/search-str'
import { Str } from 'src/str'
import { Searcher, SearchResult } from './searcher'

export class TokenParser {
    private readonly _token: Token
    private readonly _searcher: Searcher

    constructor(token: Token, searcher: Searcher) {
        this._token = token
        this._searcher = searcher
    }

    static new (token: Token, searcher: Searcher): TokenParser {
        return new TokenParser(token, searcher)
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, token: Opt<TokenResult>] {
        const [newPtr, result] = this._searcher.parse(codePtr)
        return result === SearchResult.NotEnded
            ? [newPtr, ok({ type: TokenType.TokenError, msg: Str.from(`expected end of token ${this._token.type}`) })]
            : result === SearchResult.Found
                ? [newPtr, ok(this._token)]
                : [codePtr, no()]
    }
}

export const arrow = TokenParser.new({ type: TokenType.Arrow }, SearchStr.new(Str.from('=>')))

export const plus = TokenParser.new({ type: TokenType.Plus }, SearchChar.new('+'))
export const minus = TokenParser.new({ type: TokenType.Minus }, SearchChar.new('-'))
export const mul = TokenParser.new({ type: TokenType.Mul }, SearchChar.new('*'))
export const div = TokenParser.new({ type: TokenType.Div }, SearchChar.new('/'))

