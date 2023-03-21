import { no, Opt } from 'src/opt'
import { Str } from 'src/str'
import { assertInc, unittest } from 'src/unittest'
import { TokenStream } from '../tokenizer/token-stream'
import { AstNodeResult, AstNodeType } from './ast'

export class AstStream {
    private readonly _tokenStream: TokenStream

    private constructor(tokenStream: TokenStream) {
        this._tokenStream = tokenStream
    }

    static new (code: Str): AstStream {
        const tokenStream = TokenStream.new(code)
        return new AstStream(tokenStream)
    }

    tokenStream (): TokenStream {
        return this._tokenStream
    }

    popLeft(): [AstStream, Opt<AstNodeResult>] {
        return [this, no()]
    }
}

unittest(Str.from('AstStream'), () => {
    unittest(Str.from('parsing tokens'), () => {
        const astStream = AstStream.new(Str.from('a + 10'))
        const [_astStream1, result1] = astStream.popLeft()
        assertInc(() => [result1, {
            type: AstNodeType.BinaryOperator,
            left: {
                type: AstNodeType.Identifier,
                name: Str.from('a')
            },
            right: {
                type: AstNodeType.FractionalNumberLiteral,
                value: 10
            }
        }])
    })
    // unittest(Str.from('parsing error'), () => {
    //     const astStream = AstStream.new(Str.from('a + 10'))
    // })
})
