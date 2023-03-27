import { isOk, no, ok, Opt } from 'src/opt'
import { Str } from 'src/str'
import { assertInc, unittest } from 'src/unittest'
import { Vec } from 'src/vec'
import { TokenStream } from '../lexer/token-stream'
import { AstNode, AstNodeResult, AstNodeType, BinaryOperatorType } from './ast'
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

const testAst = (sourceCode: Str, resultCode: Partial<AstNode>) => {
    assertInc(() => {
        const astStream = AstStream.new(sourceCode)
        return [astStream.popLeft(), resultCode]
    })
}

unittest(Str.from('parsing atoms'), () => {
    testAst(Str.from('true'), { type: AstNodeType.BooleanLiteral, value: true })
    testAst(Str.from('false'), { type: AstNodeType.BooleanLiteral, value: false })

    testAst(Str.from('1'), { type: AstNodeType.IntegerNumberLiteral, value: 1 })
    testAst(Str.from('1050'), { type: AstNodeType.IntegerNumberLiteral, value: 1050 })

    testAst(Str.from('.1'), { type: AstNodeType.FractionalNumberLiteral, value: 0.1 })
    testAst(Str.from('1e3'), { type: AstNodeType.FractionalNumberLiteral, value: 1000 })
    testAst(Str.from('0.5e-1'), { type: AstNodeType.FractionalNumberLiteral, value: 0.05 })

    testAst(Str.from(`'string'`), { type: AstNodeType.StringLiteral, value: Str.from('string') })
    testAst(Str.from(`"string"`), { type: AstNodeType.StringLiteral, value: Str.from('string') })
    testAst(Str.from(`'\n'`), { type: AstNodeType.StringLiteral, value: Str.from('\n') })
    testAst(Str.from(`'"'`), { type: AstNodeType.StringLiteral, value: Str.from('"') })
    testAst(Str.from(`"'"`), { type: AstNodeType.StringLiteral, value: Str.from('\'') })
    testAst(Str.from(`"a\\"b"`), { type: AstNodeType.StringLiteral, value: Str.from('a"b') })
    testAst(Str.from(`'a\\'b'`), { type: AstNodeType.StringLiteral, value: Str.from('a\'b') })

    testAst(Str.from(`alpha`), { type: AstNodeType.Identifier, name: Str.from('alpha') })
    testAst(Str.from(`$thisIs_ID`), { type: AstNodeType.Identifier, name: Str.from('$thisIs_ID') })
})

unittest(Str.from('AstStream'), () => {
    unittest(Str.from('parsing tokens'), () => {
        const astStream = AstStream.new(Str.from('a + 10'))
        const [_astStream1, result1] = astStream.popLeft()
        assertInc(() => [result1, ok({
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
        })])
    })
    // unittest(Str.from('parsing error'), () => {
    //     const astStream = AstStream.new(Str.from('a + 10'))
    // })
})
