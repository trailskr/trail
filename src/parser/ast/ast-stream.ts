import { isOk, no, Opt } from 'src/opt'
import { Str } from 'src/str'
import { assertInc, unittest } from 'src/unittest'
import { Vec } from 'src/vec'
import { TokenStream } from '../tokenizer/token-stream'
import { AstNodeResult, AstNodeType, BinaryOperatorType } from './ast'
import { AstParser } from './ast-parser'

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

    private tryAny(tokenSteam: TokenStream, parsers: Vec<AstParser>): [AstStream, Opt<AstNodeResult, void>] {
        const [newPtr, foundToken] = parsers.fold(
            [tokenSteam, no()] as [TokenStream, Opt<AstNodeResult>],
            ([ptr, _accResult], parser, _, stop) => {
                const [newPtr, result] = parser.parse(ptr)
                if (isOk(result)) {
                    stop()
                    return [newPtr, result]
                }
                return [tokenSteam, no() as Opt<AstNodeResult>]
            }
        )
      
        return isOk(foundToken)
            ? [new AstStream(newPtr), foundToken]
            : [new AstStream(tokenSteam), no()]
    }

    popLeft(): [AstStream, Opt<AstNodeResult>] {
        return this.tryAny(this._tokenStream, Vec.from([
            
        ]))
    }
}

unittest(Str.from('AstStream'), () => {
    unittest(Str.from('parsing tokens'), () => {
        const astStream = AstStream.new(Str.from('a + 10'))
        const [_astStream1, result1] = astStream.popLeft()
        assertInc(() => [result1, {
            type: AstNodeType.BinaryOperator,
            operator: BinaryOperatorType.Add,
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
