import { CharStream } from '../../lexer/char-stream'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { isNo, no, ok, Opt } from 'src/opt'
import { Slice } from 'src/slice'
import { fold, InpLeftRng } from 'src/rng'
import { SearchOne } from './search-one'

export class SearchRepeat<T> implements Searcher<T> {
    private readonly _searcher: Searcher<T>
    private readonly _slice: Slice

    private constructor (searcher: Searcher<T>, slice: Slice) {
        this._searcher = searcher
        this._slice = slice
    }
    
    static new <T>(searcher: Searcher<T>, slice: Slice): SearchRepeat<T> {
        return new SearchRepeat(searcher, slice)
    }

    searcher(): Searcher<T> {
        return this._searcher
    }

    search<R extends InpLeftRng<T>>(rng: R): [newRng: R, result: Opt<SearchResult<T>>] {
        const [newRng, times, result] = fold(
            Slice.new<usize>(no(), this._slice.right()),
            [rng, 0, no()] as [R, usize, Opt<SearchResult<T>>],
            ([curRng, times, curResult], _, stop) => {
                const [newRng, result] = this._searcher.search(curRng)
                if (isNo(result)) {
                    stop()
                    return [rng, times, no<SearchResult<T>>()]
                }
                if (result.val.type !== SearchResult.Type.Found) {
                    stop()
                    return [newRng as R, times, ok(result.val)]
                }
                return [newRng as R, times + 1, curResult]
            })

        if (isNo(result)) return [rng, no()]
        return result.val.type === SearchResult.Type.Error || times >= this._slice.orLeft()
            ? [newRng, ok(result.val)]
            : [rng, ok({ type: SearchResult.Type.NotFound })]
    }
}

unittest(Str.from('SearchRepeat'), () => {
    const spacesFrom2 = SearchRepeat.new(SearchOne.new(' '), Slice.new(ok(2), no()))

    const charStream1 = CharStream.new(Str.from('    '))
    const [newCharStream1, result1] = spacesFrom2.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 4])
    assertEq(() => [result1, ok({ type: SearchResult.Type.Found })])

    const charStream2 = CharStream.new(Str.from(' '))
    const [newCharStream2, result2] = spacesFrom2.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2, ok({ type: SearchResult.Type.NotFound })])

    const spacesTo5 = SearchRepeat.new(SearchOne.new(' '), Slice.new(no(), ok(5)))

    const charStream3 = CharStream.new(Str.from('         '))
    const [newCharStream3, result3] = spacesTo5.search(charStream3)
    assertEq(() => [newCharStream3.pos(), 5])
    assertEq(() => [result3, ok({ type: SearchResult.Type.Found })])
})