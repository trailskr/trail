import { no, ok, Opt } from 'src/opt'
import { Str } from 'src/str'
import { TokenStream } from '../lexer/token-stream'
import { AstNodeResult, AstNodeType } from './ast'
import { Finder, FindResultType } from './finder'

export class AstParser {
    private readonly _finder: Finder

    constructor(finder: Finder) {
        this._finder = finder
    }

    static new (finder: Finder): AstParser {
        return new AstParser(finder)
    }

    parse(fromTokenStream: TokenStream): [newCharStream: TokenStream, token: Opt<AstNodeResult>] {
        const [newTokenStream, result] = this._finder.parse(fromTokenStream)
        return result.type === FindResultType.NotEnded
            ? [newTokenStream, ok({ type: AstNodeType.Error, msg: Str.from('expected end of expression') })]
            : result.type === FindResultType.Found
                ? [newTokenStream, ok(result.node)]
                : [fromTokenStream, no()]
    }
}
