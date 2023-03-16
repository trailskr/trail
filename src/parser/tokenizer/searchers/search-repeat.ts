import { CodePtr } from '../code-ptr'
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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        const [newPtr, times] = Slice.new<usize>(no(), this._slice.right()).fold(
            [codePtr, 0] as [CodePtr, usize],
            ([ptr, times], _a, _, stop) => {
                const [newPtr, result] = this._searcher.parse(ptr)
                if (result !== SearchResult.Found) {
                    stop()
                    return [newPtr, times] as [CodePtr, usize]
                }
                return [newPtr, times + 1] as [CodePtr, usize]
            })
      
        return times >= this._slice.orLeft()
            ? [newPtr, SearchResult.Found]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchRepeat'), () => {
    const spacesFrom2 = SearchRepeat.new(SearchChar.new(' '), Slice.new(ok(2), no()))

    const codePtr1 = CodePtr.new(Str.from('    '))
    const [newPtr1, result1] = spacesFrom2.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 4])
    assertEq(() => [result1, SearchResult.Found])

    const codePtr2 = CodePtr.new(Str.from(' '))
    const [newPtr2, result2] = spacesFrom2.parse(codePtr2)
    assertEq(() => [newPtr2.pos(), 0])
    assertEq(() => [result2, SearchResult.NotFound])

    const spacesTo5 = SearchRepeat.new(SearchChar.new(' '), Slice.new(no(), ok(5)))

    const codePtr3 = CodePtr.new(Str.from('         '))
    const [newPtr3, result3] = spacesTo5.parse(codePtr3)
    assertEq(() => [newPtr3.pos(), 5])
    assertEq(() => [result3, SearchResult.Found])
})