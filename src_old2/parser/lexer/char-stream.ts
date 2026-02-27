import { isNo, ok, Opt } from 'src_old2/opt'
import { InpLeftRng } from 'src_old2/rng'
import { Slice } from 'src_old2/slice'
import { Str } from 'src_old2/str'

export class CharStream implements InpLeftRng<char> {
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
        return this._code.getAt(this._pos - 1)
    }

    left(): Opt<char> {
        return this._code.getAt(this._pos)
    }

    withoutLeft(): CharStream {
        const charOpt = this.left()
        if (isNo(charOpt)) return this
        return charOpt.val === '\n'
            ? this._popLeftRow()
            : this._popLeftCol()
    }

    skipLeft(amount: number): CharStream {
        const iterate = (stream: CharStream, restAmount: number): CharStream => {
            if (restAmount === 0) return stream
            return iterate(stream.withoutLeft(), restAmount - 1)
        }
        return iterate(this.withoutLeft(), amount - 1)
    }

    isEmpty(): boolean {
        return isNo(this.left())
    }

    popLeft (): [CharStream, Opt<char>] {
        return [this.withoutLeft(), this.left()]
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
