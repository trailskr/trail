import { no, ok, Opt } from 'src/opt'
import { Str } from 'src/str'
import { CharStream } from '../tokenizer/char-stream'
import { TokenStream } from '../tokenizer/token-stream'
import { AstNode, AstNodeResult, AstNodeType } from './ast'
import { Finder, FindResult } from './finder'

export class AstParser {
    private readonly _tokenFn: (oldCharStream: CharStream, newCharStream: CharStream) => AstNode
    private readonly _searcher: Finder

    constructor(tokenFn: (oldCharStream: CharStream, newCharStream: CharStream) => AstNode, searcher: Finder) {
        this._tokenFn = tokenFn
        this._searcher = searcher
    }

    static new (tokenFn: (oldCharStream: CharStream, newCharStream: CharStream) => AstNode, searcher: Finder): AstParser {
        return new AstParser(tokenFn, searcher)
    }

    parse(fromTokenStream: TokenStream): [newCharStream: TokenStream, token: Opt<AstNodeResult>] {
        const [newTokenStream, result] = this._searcher.parse(fromTokenStream)
        return result === FindResult.NotEnded
            ? [newTokenStream, ok({ type: AstNodeType.Error, msg: Str.from('expected end of expression') })]
            : result === FindResult.Found
                ? [newTokenStream, ok(this._tokenFn(fromTokenStream.charStream(), newTokenStream.charStream()))]
                : [fromTokenStream, no()]
    }
}

