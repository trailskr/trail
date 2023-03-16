import { Opt } from 'src/opt'
import { SearchChar } from './searchers/search-char'
import { CodePtr } from './code-ptr'
import { Token, TokenType } from './tokens'
import { SearchStr } from './searchers/search-str'
import { Str } from 'src/str'

export interface TokenParser {
    parse(codePtr: CodePtr): [newCodePtr: CodePtr, token: Opt<Token>]
}

export const arrow = SearchStr.new({ type: TokenType.Arrow }, Str.from('=>'))

export const plus = SearchChar.new({ type: TokenType.Plus }, '+')
export const minus = SearchChar.new({ type: TokenType.Minus }, '-')
export const mul = SearchChar.new({ type: TokenType.Mul }, '*')
export const div = SearchChar.new({ type: TokenType.Div }, '/')
