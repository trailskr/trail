import { CodePtr } from './codePtr'

export enum TokenType {
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Slash = 'Slash',
    DecimalIntegerNumber = 'DecimalIntegerNumber',
    Error = 'Error',
    EOF = 'EOF',
}

export class Token {
    constructor (
        public readonly type: TokenType,
        public readonly from: CodePtr,
        public readonly to: CodePtr
    ) {}

    text(code: string): string {
        return code.slice(this.from.pos, this.to.pos)
    }
}
