import { CharStream } from '../../parser/lexer/char-stream'
import { isNo, isOk, no, ok, Opt } from 'src/opt'
import { Searcher, SearchResult } from '../searcher'
import { assertEq, unittest } from 'src_old3/unittest'
import { Str } from 'src/str'
import { InpLeftRng } from 'src/rng'

export class SearchCharInRange<T> implements Searcher<T> {
    private readonly _from: T
    private readonly _to: T

    private constructor(from: T, to: T) {
        this._from = from
        this._to = to
    }

    static new<T>(from: T, to: T): SearchCharInRange<T> {
        return new SearchCharInRange(from, to)
    }

    from(): T {
        return this._from
    }

    to(): T {
        return this._to
    }

    search<R extends InpLeftRng<T>>(from: R): [newRng: R, result: Opt<SearchResult<T>>] {
        const [newRng, charOpt] = from.popLeft()

        if (isNo(charOpt)) return [from, no()]
        return isOk(charOpt) &&
            charOpt.val >= this._from && charOpt.val <= this._to
            ? [newRng as R, ok({ type: SearchResult.Type.Found, val: charOpt.val, from, to: newRng as R })]
            : [from, ok({ type: SearchResult.Type.NotFound })]
    }
}

unittest(Str.from('SearchStr'), () => {
    const digit = SearchCharInRange.new('0', '9')

    const charStream0 = CharStream.new(Str.from(''))
    const [newCharStream0, result0] = digit.search(charStream0)
    assertEq(() => [newCharStream0.pos(), 0])
    assertEq(() => [result0, no()])

    const charStream1 = CharStream.new(Str.from('5'))
    const [newCharStream1, result1] = digit.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1, ok<SearchResult<char>>({
        type: SearchResult.Type.Found,
        val: '5',
        from: charStream1,
        to: newCharStream1
    })])

    const charStream2 = CharStream.new(Str.from('_'))
    const [newCharStream2, result2] = digit.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2, ok({ type: SearchResult.Type.NotFound })])
})
