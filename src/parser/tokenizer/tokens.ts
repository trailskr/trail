import { Str } from "src/str"

export enum TokenType {
    Indent = 'Indent',
    LineEnd = 'LineEnd',
    TokenError = 'TokenError',

    Arrow = 'Arrow',

    Plus = 'Plus',
    Minus = 'Minus',
    Mul = 'Mul',
    Div = 'Div',
}

export interface Indent { type: TokenType.Indent, size: usize }
export interface LineEnd { type: TokenType.LineEnd }

export interface Arrow { type: TokenType.Arrow }

export interface Plus { type: TokenType.Plus }
export interface Minus { type: TokenType.Minus }
export interface Mul { type: TokenType.Mul }
export interface Div { type: TokenType.Div }

export type Token =
    Indent |
    LineEnd |

    Arrow |

    Plus |
    Minus |
    Mul |
    Div

export interface TokenError {
    type: TokenType.TokenError
    msg: Str
}

export type TokenResult = Token | TokenError
