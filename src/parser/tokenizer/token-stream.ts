import { isNo, no, Opt } from "src/opt"
import { Str } from "src/str"
import { Vec } from "src/vec"
import { CodePtr } from "./code-ptr"
import { SearchChar } from "./searchers/search-char"
import { SearchSequence } from "./searchers/search-sequence"
import { TokenResult } from "./tokens"

const whiteSpace = SearchSequence.new(Vec.from([
    { searcher: SearchChar.new('\r'), flag: SequenceFlag.Optional },
    { searcher: SearchChar.new('\n'), flag: SequenceFlag.None },
]))

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
            
        }
    }
}