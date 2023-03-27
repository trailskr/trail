import { Str } from 'src/str'
import { TokenStream } from '../lexer/token-stream'
import { AstNode } from './ast'

export enum FindResultType {
    Found = 'Found',
    NotEnded = 'NotEnded',
    NotFound = 'NotFound',
}

export interface Found { type: FindResultType.Found, node: AstNode }
export interface NotEnded { type: FindResultType.NotEnded, msg: Str }
export interface NotFound { type: FindResultType.NotFound }

export type FindResult = Found | NotEnded | NotFound

export interface Finder {
    parse(tokenStream: TokenStream): [newTokenStream: TokenStream, result: FindResult]
}