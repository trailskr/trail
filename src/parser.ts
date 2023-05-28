import { BinaryOperatorExpression, BinaryOperatorType, DecimalIntegerNumberExpression, Expression } from './expression'
import { Lexer } from './lexer'
import { Token, TokenType } from './token'
import { unittest } from './unittest'

export class Parser {
    constructor(
        public readonly code: string,
        public readonly tokens: Token[],
        public pos = 0
    ) {}

    peek(offset = 0): Token {
        const pos = this.pos + offset
        if (pos >= this.tokens.length) return this.tokens[this.tokens.length - 1]
        return this.tokens[pos]
    }

    match(tokenType: TokenType): bool {
        const token = this.peek()
        if (token.type !== tokenType) return false
        this.pos += 1
        return true
    }

    primary(): Expression {
        const token = this.peek()
        if (this.match(TokenType.DecimalIntegerNumber)) {
            return new DecimalIntegerNumberExpression(token.from, token.to, BigInt(token.text(this.code)))
        }
        throw new Error('Unknown expression')
    }

    unary(): Expression {
        return this.primary()
    }

    multiplicative(): Expression {
        let expr = this.unary()

        for (;;) {
            if (this.match(TokenType.Star)) {
                const unary = this.unary()
                expr = new BinaryOperatorExpression(expr.from, unary.to, BinaryOperatorType.Mul, expr, unary)
                continue
            }
            if (this.match(TokenType.Slash)) {
                const unary = this.unary()
                expr = new BinaryOperatorExpression(expr.from, unary.to, BinaryOperatorType.Div, expr, unary)
                continue
            }
            break
        }

        return expr
    }

    additive(): Expression {
        let expr = this.multiplicative()

        for (;;) {
            if (this.match(TokenType.Plus)) {
                const multiplicative = this.multiplicative()
                expr = new BinaryOperatorExpression(expr.from, multiplicative.to, BinaryOperatorType.Add, expr, multiplicative)
                continue
            }
            if (this.match(TokenType.Minus)) {
                const multiplicative = this.multiplicative()
                expr = new BinaryOperatorExpression(expr.from, multiplicative.to, BinaryOperatorType.Sub, expr, multiplicative)
                continue
            }
            break
        }

        return expr
    }

    expression(): Expression {
        return this.additive()
    }

    parseAll(): Expression[] {
        const result: Expression[] = []
        while (!this.match(TokenType.EOF)) {
            result.push(this.expression())
        }
        return result
    }
}

unittest('lexer', () => {
    const code = '2 + 351'
    const lexer = new Lexer(code)
    const tokens = lexer.tokenizeAll()
    const parser = new Parser(code, tokens)
    const expressions = parser.parseAll()
    expressions.forEach((expr) => {
        console.log(expr, expr.eval())
    })
})
