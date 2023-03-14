import { isNo, no, Opt } from "src/opt"
import { Rng } from "src/rng"
import { ReadSig, Sig, WriteSig } from "src/sig"
import { Str } from "src/str"
import { isWhiteSpace } from "./token-parser"
import { Token } from "./tokens"

export class CodePtr {
    private readonly _code: Str
    private readonly _pos: usize
    private readonly _col: usize
    private readonly _row: usize

    private constructor(code: Str, pos = 0, col = 1, row = 1) {
        this._code = code
        this._pos = pos
        this._col = col
        this._row = row
    }

    static new (code: Str): CodePtr {
        return new CodePtr(code)
    }

    code (): Str {
        return this._code
    }

    pos (): usize {
        return this._pos
    }

    col (): usize {
        return this._col
    }

    row (): usize {
        return this._row
    }

    next (): [CodePtr, Opt<char>] {
        const charOpt = this._code.get(this._pos)
        if (isNo(charOpt)) return [this, charOpt]
        if (charOpt.val === '\n') {
            return [this._nextRow(), charOpt]
        } else {
            return [this._nextCol(), charOpt]
        }
    }

    private _nextCol (): CodePtr {
        return new CodePtr(this._code, this._pos + 1, this._col + 1, this._row)
    }

    private _nextRow (): CodePtr {
        return new CodePtr(this._code, this._pos + 1, this._col, this._row + 1)
    }
}

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
            const [charOpt] = this._codePtr.next()
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