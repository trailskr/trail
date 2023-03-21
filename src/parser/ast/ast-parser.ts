import { no, ok, Opt } from 'src/opt'
import { Str } from 'src/str'
import { TokenStream } from '../tokenizer/token-stream'
import { AstNode, AstNodeResult, AstNodeType } from './ast'
import { Finder, FindResult } from './finder'

export class AstParser {
    private readonly _tokenFn: (oldCharStream: TokenStream, newCharStream: TokenStream) => AstNode
    private readonly _searcher: Finder

    constructor(tokenFn: (oldCharStream: TokenStream, newCharStream: TokenStream) => AstNode, searcher: Finder) {
        this._tokenFn = tokenFn
        this._searcher = searcher
    }

    static new (tokenFn: (oldCharStream: TokenStream, newCharStream: TokenStream) => AstNode, searcher: Finder): AstParser {
        return new AstParser(tokenFn, searcher)
    }

    parse(fromTokenStream: TokenStream): [newCharStream: TokenStream, token: Opt<AstNodeResult>] {
        const [newTokenStream, result] = this._searcher.parse(fromTokenStream)
        return result === FindResult.NotEnded
            ? [newTokenStream, ok({ type: AstNodeType.Error, msg: Str.from('expected end of token') })]
            : result === FindResult.Found
                ? [newTokenStream, ok(this._tokenFn(fromTokenStream, newTokenStream))]
                : [fromTokenStream, no()]
    }
}

