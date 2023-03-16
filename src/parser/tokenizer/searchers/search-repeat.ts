import { CodePtr } from '../code-ptr'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { SearchChar } from './search-char'
import { ok, Opt } from 'src/opt'

export class SearchRepeat implements Searcher {
    private readonly _searcher: Searcher

    private constructor (searcher: Searcher, from: usize, to: Opt<usize>) {
        this._searcher = searcher
    }
    
    static new (searcher: Searcher, from: usize, to: Opt<usize>): SearchRepeat {
        return new SearchRepeat(searcher, from, to)
    }

    searcher(): Searcher {
        return this._searcher
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        const [newPtr, isFound] = this._searcher.fold(
            [codePtr, false] as [CodePtr, bool],
            ([ptr, isFound], searcher, _, stop) => {
                const [newPtr, result] = searcher.parse(ptr)
                const newIsFound = isFound || result === SearchResult.Found
                if (newIsFound) {
                    stop()
                    return [newPtr, true]
                }
                return [codePtr, false]
            }
        )
      
        return isFound
            ? [newPtr, SearchResult.Found]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchAny'), () => {
    const aOrB = SearchRepeat.new(SearchChar.new(' '), 4, ok(5))

    const codePtr1 = CodePtr.new(Str.from('a'))
    const [newPtr1, result1] = aOrB.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])

    const codePtr2 = CodePtr.new(Str.from('b'))
    const [newPtr2, result2] = aOrB.parse(codePtr2)
    assertEq(() => [newPtr2.pos(), 1])
    assertEq(() => [result2, SearchResult.Found])

    const codePtr3 = CodePtr.new(Str.from('c'))
    const [newPtr3, result3] = aOrB.parse(codePtr3)
    assertEq(() => [newPtr3.pos(), 0])
    assertEq(() => [result3, SearchResult.NotFound])
})