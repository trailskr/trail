import { CharStream } from '../../lexer/char-stream'
import { isNo, no, ok, Opt } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { InpLeftRng } from 'src/rng'

export class SearchOne<T> implements Searcher<T> {
    private readonly _toFind: T

    private constructor (_toFind: T) {
        this._toFind = _toFind
    }
    
    static new <T>(toFind: T): SearchOne<T> {
        return new SearchOne(toFind)
    }

    toFind(): T {
        return this._toFind
    }

    search<R extends InpLeftRng<T>>(rng: R): [newCharStream: R, result: Opt<SearchResult<T>>] {
        const [newRng, optVal] = rng.popLeft()
        if (isNo(optVal)) return [rng, no()]
        return optVal.val === this._toFind
            ? [newRng as R, ok({ type: SearchResult.Type.Found, val: optVal.val })]
            : [rng as R, ok({ type: SearchResult.Type.NotFound })]
    }
}

unittest(Str.from('SearchOne'), () => {
    const plus = SearchOne.new('+')

    const charStream1 = CharStream.new(Str.from('+'))
    const [newCharStream1, result1] = plus.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1, ok<SearchResult<char>>({ type: SearchResult.Type.Found, val: '+' })])

    const charStream2 = CharStream.new(Str.from('-'))
    const [newCharStream2, result2] = plus.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2, ok({ type: SearchResult.Type.NotFound })])

    const charStream3 = CharStream.new(Str.from(''))
    const [newCharStream3, result3] = plus.search(charStream3)
    assertEq(() => [newCharStream3.pos(), 0])
    assertEq(() => [result3, no()])
})
