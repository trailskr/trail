import { assertEq, unittest } from './unittest'

interface CodePtr {
    code: string
    pos: usize
    col: usize
    row: usize
}

const newCodePtr = (code: string) :CodePtr => {
    return { code, pos: 0, col: 1, row: 1 }
}

const peek = (ptr: CodePtr, offset = 0): char => {
    const pos = ptr.pos + offset
    if (pos >= ptr.code.length) return '\0'
    return ptr.code[pos]
}

const nextCol = ({ code, pos, col, row }: CodePtr): CodePtr => {
    return { code, pos: pos + 1, col: col + 1, row }
}

const nextRow = ({ code, pos, col, row }: CodePtr): CodePtr => {
    return { code, pos: pos + 1, col, row: row + 1 }
}

const nextPtr = (ptr: CodePtr, count = 1): CodePtr => {
    const char = peek(ptr)
    const next = char === '\n'
        ? nextRow(ptr)
        : nextCol(ptr)
    if (count === 1) return next
    return nextPtr(next, count - 1)
}

const nextChar = (ptr: CodePtr): [CodePtr, char] => {
    const char = peek(ptr)
    return [nextPtr(ptr), char]
}

const tokenText = ({ from, to }: Token): string => {
    return from.code.slice(from.pos, to.pos)
}

enum TokenType {
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Slash = 'Slash',
    DecimalIntegerNumber = 'DecimalIntegerNumber',
    Error = 'Error',
    EOF = 'EOF',
}

interface Token {
    type: TokenType
    from: CodePtr
    to: CodePtr
}

const isDigit = (char: char): bool => {
    return char <= '9' && char >= '0'
}

const binaryOps = ['+', '-', '*', '/']
const binaryOpsTypes = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash] as const

const isBinaryOperator = (char: char): bool => {
    return binaryOps.includes(char)
}

const nextNumber = (from: CodePtr, to = from): Token => {
    const [nextPtr, char] = nextChar(to)
    if (!isDigit(char)) {
        return {
            type: TokenType.DecimalIntegerNumber,
            from,
            to
        }
    }
    return nextNumber(from, nextPtr)
}

const nextBinaryOperator = (from: CodePtr): Token => {
    const char = peek(from)
    const type = binaryOpsTypes[binaryOps.indexOf(char)]
    return { type, from, to: nextPtr(from) }
}

const nextToken = (from: CodePtr): Token => {
    if (from.pos >= from.code.length) return { from, to: from, type: TokenType.EOF }
    const char = peek(from)
    if (isDigit(char)) return nextNumber(from)
    if (isBinaryOperator(char)) return nextBinaryOperator(from)
    return nextToken(nextPtr(from))
}

const allTokens = (from: CodePtr, result: Token[] = []): Token[] => {
    const token = nextToken(from)
    const tokens = [...result, token]
    if (token.type === TokenType.EOF) return tokens
    return allTokens(token.to, tokens)
}

unittest('lexer', () => {
    const from = newCodePtr('2 + 22')
    const tokens = allTokens(from)
    assertEq(() => [
        tokens,
        [
            { type: TokenType.DecimalIntegerNumber, from, to: nextPtr(from) },
            { type: TokenType.Plus, from: nextPtr(from, 2), to: nextPtr(from, 3) },
            { type: TokenType.DecimalIntegerNumber, from: nextPtr(from, 4), to: nextPtr(from, 6) },
            { type: TokenType.EOF, from: nextPtr(from, 6), to: nextPtr(from, 6) },
        ]
    ])
    assertEq(() => [tokens.map(tokenText), ['2', '+', '22', '']])
})
