import { isNo, Opt } from "src/opt"
import { Str } from "src/str"

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