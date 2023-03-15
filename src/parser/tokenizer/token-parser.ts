import { Opt } from 'src/opt'
import { SearchChar } from './searchers/search-char'
import { CodePtr } from './code-ptr'
import { Token, TokenType } from './tokens'

export interface TokenParser {
    parse(codePtr: CodePtr): [newCodePtr: CodePtr, char: Opt<Token>]
}

export const plus = SearchChar.new({ type: TokenType.Plus }, '+')
export const minus = SearchChar.new({ type: TokenType.Minus }, '+')
export const div = SearchChar.new({ type: TokenType.Div }, '+')
export const mul = SearchChar.new({ type: TokenType.Mul }, '+')

