export enum TokeType {
    Indent,
    LineEnd,
    TokenError,
}

export interface Indent { type: TokeType.Indent, size: usize }
export interface LineEnd { type: TokeType.LineEnd }

export type Token = Indent | LineEnd

export interface TokenError {
    type: TokeType.TokenError
    msg: string
}

export type TokenResult = Token | TokenError
