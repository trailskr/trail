import { Opt } from "src/opt"
import { Char } from "./char"
import { CodePtr } from "./code-ptr"
import { Token } from "./tokens"

export const isWhiteSpace = (char: char): bool => {
    return char === ' '
}

export const inRange = (char: char, from: char, to: char): bool => {
    return char >= from && char <= to
}

export interface CharParser {
    parse(codePtr: CodePtr): [newCodePtr: CodePtr, char: Opt<Token>]
}

export const whiteSpace = Char.new(' ')
