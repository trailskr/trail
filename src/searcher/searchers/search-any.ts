import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { Vec } from 'src/vec'
import { isOk, no, ok, Opt } from 'src/opt'
import { findItem, InpLeftRng, map } from 'src/rng'
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

    search<R extends InpLeftRng<T>>(from: R): [newRng: R, result: Opt<SearchResult<T>>] {
        const result = findItem(
            map(this._items, (searcher) => searcher.search(from)),
            ([_rng, result]) => isOk(result)
        )
        return isOk(result)
            ? result.val as [R, Opt<SearchResult<T>>]
            : [from, no()]
    }
}

unittest(Str.from('SearchAny'), () => {
    const aOrB = SearchAny.new(Vec.from([
        SearchOne.new('a'),
        SearchOne.new('b'),
    ]))

    const charStream0 = CharStream.new(Str.from(''))
    const [_newCharStream0, result0] = aOrB.search(charStream0)
    assertEq(() => [newCharStream1.pos(), 0])
    assertEq(() => [result0, no()])

    const charStream1 = CharStream.new(Str.from('a'))
    const [newCharStream1, result1] = aOrB.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1, ok<SearchResult<char>>({
        type: SearchResult.Type.Found,
        val: 'a',
        from: charStream1,
        to: newCharStream1
    })])

    const charStream2 = CharStream.new(Str.from('b'))
    const [newCharStream2, result2] = aOrB.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 1])
    assertEq(() => [result2, ok<SearchResult<char>>({
        type: SearchResult.Type.Found,
        val: 'b',
        from: charStream2,
        to: newCharStream2
    })])

    const charStream3 = CharStream.new(Str.from('c'))
    const [newCharStream3, result3] = aOrB.search(charStream3)
    assertEq(() => [newCharStream3.pos(), 0])
    assertEq(() => [result3, ok({ type: SearchResult.Type.NotFound })])
})