import { isNo, no, Opt } from "src/opt"
import { Str } from "src/str"
import { CodePtr } from "./code-ptr"
import { TokenResult } from "./tokens"

const isWhiteSpace = (char: char): bool => {
    return char === ' '
}

export class TokenStream {
    private readonly _codePtr: CodePtr
    private readonly _isParsingIndent: bool

    private constructor(codePtr: CodePtr, isParsingIndent: bool = true) {
        this._codePtr = codePtr
        this._isParsingIndent = isParsingIndent
    }

    static new (code: Str): TokenStream {
        const codePtr = CodePtr.new(code)
        return new TokenStream(codePtr, true)
    }

    popLeft(): [TokenStream, Opt<[TokenResult, CodePtr]>] {
        if (this._isParsingIndent) {
            let ptr: CodePtr
            let charOpt: Opt<char>
            let spaces = 0
            while (true) {
                [ptr, charOpt] = this._codePtr.next()
                if (isNo(charOpt)) {
                    return [new TokenStream(ptr, false), no()]
                }
                if (isWhiteSpace(charOpt.val)) {
                    spaces += 1
                } else {
                    const 
                }
            }
        }
    }
}