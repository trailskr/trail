import { CharStream } from '../char-stream'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { SearchChar } from './search-char'
import { no, ok } from 'src/opt'
import { Slice } from 'src/slice'

export class SearchRepeat implements Searcher {
    private readonly _searcher: Searcher
    private readonly _slice: Slice

    private constructor (searcher: Searcher, slice: Slice) {
        this._searcher = searcher
        this._slice = slice
    }
    
    static new (searcher: Searcher, slice: Slice): SearchRepeat {
        return new SearchRepeat(searcher, slice)
    }

    searcher(): Searcher {
        return this._searcher
    }

    parse(charStream: CharStream): [newCharStream: CharStream, result: SearchResult] {
        const [newPtr, times] = Slice.new<usize>(no(), this._slice.right()).fold(
            [charStream, 0] as [CharStream, usize],
            ([ptr, times], _a, _, stop) => {
                const [newPtr, result] = this._searcher.parse(ptr)
                if (result !== SearchResult.Found) {
                    stop()
                    return [newPtr, times] as [CharStream, usize]
                }
                return [newPtr, times + 1] as [CharStream, usize]
            })
      
        return times >= this._slice.orLeft()
            ? [newPtr, SearchResult.Found]
            : [charStream, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchRepeat'), () => {
    const spacesFrom2 = SearchRepeat.new(SearchChar.new(' '), Slice.new(ok(2), no()))

    const charStream1 = CharStream.new(Str.from('    '))
    const [newPtr1, result1] = spacesFrom2.parse(charStream1)
    assertEq(() => [newPtr1.pos(), 4])
    assertEq(() => [result1, SearchResult.Found])

    const charStream2 = CharStream.new(Str.from(' '))
    const [newPtr2, result2] = spacesFrom2.parse(charStream2)
    assertEq(() => [newPtr2.pos(), 0])
    assertEq(() => [result2, SearchResult.NotFound])

    const spacesTo5 = SearchRepeat.new(SearchChar.new(' '), Slice.new(no(), ok(5)))

    const charStream3 = CharStream.new(Str.from('         '))
    const [newPtr3, result3] = spacesTo5.parse(charStream3)
    assertEq(() => [newPtr3.pos(), 5])
    assertEq(() => [result3, SearchResult.Found])
})