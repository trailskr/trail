import { CharStream } from '../../parser/lexer/char-stream'
import { Opt, isNo, no, ok } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { InpLeftRng } from 'src/rng'
import { Vec } from 'src/vec'
import { SearchResult, Searcher } from '../searcher'

export class SearchUntil<T> implements Searcher<T, Vec<T>> {
    private readonly _until: T
    private readonly _escape: T

    private constructor(until: T, escape: T) {
        this._until = until
        this._escape = escape
    }

    static new<T>(until: T, escape: T): SearchUntil<T> {
        return new SearchUntil(until, escape)
    }

    until(): T {
        return this._until
    }

    escape(): T {
        return this._escape
    }

    search<R extends InpLeftRng<T>>(from: R): [newRng: R, result: Opt<SearchResult<T, Vec<T>>>] {
        const iterate = (curRng: R, curResult: Vec<T>, prevResult: Opt<T>): [newRng: R, result: Opt<SearchResult<T, Vec<T>>>] => {
            const [newRng, result] = curRng.popLeft()
            if (isNo(result)) {
                return [from, ok({ type: SearchResult.Type.Error, msg: Str.from(`expected end of sequence: ${this._until}`) })]
            }
            if (result.val === this._until && (isNo(prevResult) || prevResult.val !== this._escape)) {
                return [curRng, ok({ type: SearchResult.Type.Found, from, to: curRng as R, val: curResult })]
            }
            const newResult = curResult.pushRight(result.val)
            return iterate(newRng as R, newResult, result)
        }

        return iterate(from, Vec.new(), no())
    }
}

unittest(Str.from('SearchUntil'), () => {
    const exceptDoubleQuote = SearchUntil.new('"', '\\')

    const charStream1 = CharStream.new(Str.from('\\""a'))
    const [newCharStream1, result1] = exceptDoubleQuote.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 2])
    assertEq(() => [result1, ok<SearchResult<char, Vec<char>>>({
        type: SearchResult.Type.Found,
        val: Vec.from(['\\', '"']),
        from: charStream1,
        to: newCharStream1
    })])

    const charStream2 = CharStream.new(Str.from('hello'))
    const [_newCharStream2, result2] = exceptDoubleQuote.search(charStream2)
    assertEq(() => [newCharStream1.pos(), 2])
    assertEq(() => [result2, ok<SearchResult<char, Vec<char>>>({
        type: SearchResult.Type.Error,
        msg: Str.from('expected end of sequence: "')
    })])

    const charStream3 = CharStream.new(Str.from(''))
    const [_newCharStream3, result3] = exceptDoubleQuote.search(charStream3)
    assertEq(() => [newCharStream1.pos(), 2])
    assertEq(() => [result3, ok<SearchResult<char, Vec<char>>>({
        type: SearchResult.Type.Error,
        msg: Str.from('expected end of sequence: "')
    })])
})