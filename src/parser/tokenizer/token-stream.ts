import { isNo, no, Opt } from "src/opt"
import { ReadSig, Sig, WriteSig } from "src/sig"
import { Str } from "src/str"
import { CodePtr } from "./code-ptr"
import { isWhiteSpace } from "./token-parser"
import { Token } from "./tokens"

export class TokenStream {
    private readonly _codePtr: CodePtr
    private readonly _parsingIndent: ReadSig<bool>
    private readonly _setParsingIndent: WriteSig<bool>

    constructor(codePtr: CodePtr, isParsingIndent: bool = true) {
        this._codePtr = codePtr
        ;[this._parsingIndent, this._setParsingIndent] = Sig(isParsingIndent)
    }

    static new (code: Str): TokenStream {
        const codePtr = CodePtr.new(code)
        return new TokenStream(codePtr, true)
    }

    popLeft(): [TokenStream, Opt<[Token, CodePtr]>] {
        while (true) {
            const [codePtr, charOpt] = this._codePtr.next()
            if (isNo(charOpt)) return [this, no()]
            const char = charOpt.val
            if (this._parsingIndent()) {
                const [spaces, setSpaces] = Sig(0)
                if (isWhiteSpace(char)) {
                    setSpaces.with(spaces => spaces +1)
                }
            }
        }
    }
}