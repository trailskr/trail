import { CharStream } from '../char-stream'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { Vec } from 'src/vec'
import { SearchChar } from './search-char'

export class SearchAny implements Searcher {
    private readonly _items: Vec<Searcher>

    private constructor (items: Vec<Searcher>) {
        this._items = items
    }
    
    static new (items: Vec<Searcher>): SearchAny {
        return new SearchAny(items)
    }

    items(): Vec<Searcher> {
        return this._items
    }

    parse(charStream: CharStream): [newCharStream: CharStream, result: SearchResult] {
        const [newPtr, isFound] = this._items.fold(
            [charStream, false] as [CharStream, bool],
            ([ptr, _isFound], searcher, _, stop) => {
                const [newPtr, result] = searcher.parse(ptr)
                const newIsFound = result === SearchResult.Found
                if (newIsFound) {
                    stop()
                    return [newPtr, true]
                }
                return [ptr, false]
            }
        )
      
        return isFound
            ? [newPtr, SearchResult.Found]
            : [charStream, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchAny'), () => {
    const aOrB = SearchAny.new(Vec.from([
        SearchChar.new('a'),
        SearchChar.new('b'),
    ]))

    const charStream1 = CharStream.new(Str.from('a'))
    const [newPtr1, result1] = aOrB.parse(charStream1)
    assertEq(() => [newPtr1.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])

    const charStream2 = CharStream.new(Str.from('b'))
    const [newPtr2, result2] = aOrB.parse(charStream2)
    assertEq(() => [newPtr2.pos(), 1])
    assertEq(() => [result2, SearchResult.Found])

    const charStream3 = CharStream.new(Str.from('c'))
    const [newPtr3, result3] = aOrB.parse(charStream3)
    assertEq(() => [newPtr3.pos(), 0])
    assertEq(() => [result3, SearchResult.NotFound])
})