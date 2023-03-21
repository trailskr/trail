import { isNo, ok, Opt } from 'src/opt'
import { Slice } from 'src/slice'
import { Str } from 'src/str'

export class CharStream {
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

    static new (code: Str): CharStream {
        return new CharStream(code)
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

    getCharBefore (): Opt<char> {
        return this._code.get(this._pos - 1)
    }

    popLeft (): [CharStream, Opt<char>] {
        const charOpt = this._code.get(this._pos)
        if (isNo(charOpt)) return [this, charOpt]
        if (charOpt.val === '\n') {
            return [this._popLeftRow(), charOpt]
        } else {
            return [this._popLeftCol(), charOpt]
        }
    }

    lenFrom(charStream: CharStream): usize {
        return this._pos - charStream._pos
    }

    textFrom(charStream: CharStream): Str {
        return this._code.slice(() => Slice.new(ok(charStream._pos), ok(this._pos)))
    }

    private _popLeftCol (): CharStream {
        return new CharStream(this._code, this._pos + 1, this._col + 1, this._row)
    }

    private _popLeftRow (): CharStream {
        return new CharStream(this._code, this._pos + 1, 1, this._row + 1)
    }
}