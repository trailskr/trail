import { CodePtr } from "./code-ptr"
import { CharParser } from "./char-parser"
import { isOk, no, Opt } from "src/opt"

export class Char implements CharParser {
    private readonly _char: char

    constructor (char: char) {
        this._char = char
    }
    
    static new (char: char): Char {
        return new Char(char)
    }

    char(): char {
        return this._char
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, char: Opt<char>] {
        const [ptr, charOpt] = codePtr.next()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [ptr, charOpt]
            : [codePtr, no()]
    }
}
