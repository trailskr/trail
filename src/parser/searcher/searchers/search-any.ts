import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher } from '../searcher'
import { Vec } from 'src/vec'
import { isNo, isOk, no, ok, Opt } from 'src/opt'
import { fold, InpLeftRng } from 'src/rng'
import { SearchOne } from './search-one'
import { CharStream } from 'src/parser/lexer/char-stream'

export class SearchAny<T> implements Searcher<T> {
    private readonly _items: Vec<Searcher<T>>

    private constructor (items: Vec<Searcher<T>>) {
        this._items = items
    }
    
    static new <T>(items: Vec<Searcher<T>>): SearchAny<T> {
        return new SearchAny(items)
    }

    items(): Vec<Searcher<T>> {
        return this._items
    }

    search<R extends InpLeftRng<T>>(rng: R): [newCharStream: R, result: Opt<Opt<Opt<T, Str>>>] {
        const [newRng, result] = fold(
            this._items,
            [rng, ok(no())] as [R, Opt<Opt<T, Str>>],
            ([curRng, res], searcher, stop) => {
                const [newStream, optVal] = searcher.search(curRng)
                if (isNo(optVal)) return [rng, no<Opt<T, Str>>()]
                const val = optVal.val
                if (isOk(val)) {
                    stop()
                    return [newStream as R, ok(val.val)]
                }
                return [rng, res]
            }
        )

        if (isNo(result)) return [rng, no()]
        return [newRng, ok(result)]
    }
}

unittest(Str.from('SearchAny'), () => {
    const aOrB = SearchAny.new(Vec.from([
        SearchOne.new('a'),
        SearchOne.new('b'),
    ]))

    const charStream1 = CharStream.new(Str.from('a'))
    const [newCharStream1, result1] = aOrB.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])

    const charStream2 = CharStream.new(Str.from('b'))
    const [newCharStream2, result2] = aOrB.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 1])
    assertEq(() => [result2, SearchResult.Found])

    const charStream3 = CharStream.new(Str.from('c'))
    const [newCharStream3, result3] = aOrB.search(charStream3)
    assertEq(() => [newCharStream3.pos(), 0])
    assertEq(() => [result3, SearchResult.NotFound])
})