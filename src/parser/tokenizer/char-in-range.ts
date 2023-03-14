import { CodePtr } from "./code-ptr"
import { CharParser } from "./char-parser"
import { isOk, no, Opt } from "src/opt"

export class CharInRange implements CharParser {
    private readonly _from: char
    private readonly _to: char

    constructor (from: char, to: char) {
        this._from = from
        this._to = to
    }
    
    static new (from: char, to: char): CharInRange {
        return new CharInRange(from, to)
    }

    from(): char {
        return this._from
    }

    to(): char {
        return this._to
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, char: Opt<char>] {
        const [ptr, charOpt] = codePtr.next()
      
        return isOk(charOpt) &&
            charOpt.val >= this._from && charOpt.val <= this._to
                ? [ptr, charOpt]
                : [codePtr, no()]
    }
}
