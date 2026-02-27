
import { CodePtr } from './codePtr'
import { Token, TokenType } from './token'
import { assertEq, unittest } from './unittest'

const isDigit = (char: char): bool => {
    return char <= '9' && char >= '0'
}

const binaryOps = ['+', '-', '*', '/']
const binaryOpsTypes = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash] as const

const isBinaryOperator = (char: char): bool => {
    return binaryOps.includes(char)
}

export class Lexer {
    constructor (
        public readonly code: string,
        public ptr: CodePtr = new CodePtr()
    ) {}

    peek(offset = 0): char {
        const pos = this.ptr.pos + offset
        if (pos >= this.code.length) return '\0'
        return this.code[pos]
    }

    next(): char {
        const char = this.peek()
        this.ptr = this.ptr.next(char === '\n')
        return char
    }

    tokenizeNumber(from: CodePtr = this.ptr): Token {
        const to = this.ptr
        const char = this.next()
        if (!isDigit(char)) {
            return new Token(TokenType.DecimalIntegerNumber, from, to)
        }
        return this.tokenizeNumber(from)
    }

    tokenizeBinaryOperator(from: CodePtr = this.ptr): Token {
        const char = this.next()
        const type = binaryOpsTypes[binaryOps.indexOf(char)]
        return new Token(type, from, this.ptr)
    }

    tokenize(from: CodePtr = this.ptr): Token {
        if (this.ptr.pos >= this.code.length) {
            return new Token(TokenType.EOF, this.ptr, this.ptr)
        }
        const char = this.peek()
        if (isDigit(char)) return this.tokenizeNumber()
        if (isBinaryOperator(char)) return this.tokenizeBinaryOperator()
        this.next()
        return this.tokenize(from)
    }

    tokenizeAll(): Token[] {
        let token = this.tokenize()
        const tokens = []
        while (token.type !== TokenType.EOF) {
            tokens.push(token)
            token = this.tokenize()
        }
        tokens.push(token) // push EOF
        return tokens
    }
}

unittest('lexer', () => {
    const code = '   2   +  351   '
    const lexer = new Lexer(code)
    const tokens = lexer.tokenizeAll()
    const joinedTokens = tokens.slice(0, -1).map((token) => token.text(code)).join(' ')
    assertEq(() => [tokens.length, 4])
    assertEq(() => ['2 + 351', joinedTokens])
})
