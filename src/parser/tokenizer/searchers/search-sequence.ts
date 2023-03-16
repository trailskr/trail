import { CodePtr } from '../code-ptr'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'
import { Vec } from 'src/vec'
import { SearchChar } from './search-char'

export enum SequenceFlag {
    None = 'None',
    Optional = 'Optional',
    RequireEnd = 'RequireEnd',
    End = 'End',
}

export interface SequenceItem {
    searcher: Searcher,
    flag: SequenceFlag
}

export class SearchSequence implements Searcher {
    private readonly _items: Vec<SequenceItem>

    private constructor (items: Vec<SequenceItem>) {
        this._items = items
    }
    
    static new (items: Vec<SequenceItem>): SearchSequence {
        return new SearchSequence(items)
    }

    items(): Vec<SequenceItem> {
        return this._items
    }

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        /// isEndend is false when was SequenceFlag.RequreEnd item and was't SequenceFlag.End
        const [newPtr, isEnded] = this._items.fold(
            [codePtr, true] as [CodePtr, bool],
            ([ptr, isEnded], { searcher, flag }, _, stop) => {
                const [newPtr, result] = searcher.parse(ptr)
                if (result !== SearchResult.Found && flag !== SequenceFlag.Optional) {
                    stop()
                    return [isEnded ? codePtr : newPtr, isEnded] as [CodePtr, bool]
                }
                const newIsEnded = flag === SequenceFlag.RequireEnd
                    ? false
                    : isEnded || flag === SequenceFlag.End
                return [newPtr, newIsEnded] as [CodePtr, bool]
            }
        )
      
        return newPtr != codePtr
            ? isEnded
                ? [newPtr, SearchResult.Found]
                : [newPtr, SearchResult.NotEnded]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchSequence'), () => {
    const lineEnd = SearchSequence.new(Vec.from([
        { searcher: SearchChar.new('\r'), flag: SequenceFlag.Optional },
        { searcher: SearchChar.new('\n'), flag: SequenceFlag.None },
    ]))

    const codePtr1 = CodePtr.new(Str.from('\r\n'))
    const [newPtr1, result1] = lineEnd.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 2])
    assertEq(() => [result1, SearchResult.Found])

    const codePtr2 = CodePtr.new(Str.from('\n'))
    const [newPtr2, result2] = lineEnd.parse(codePtr2)
    assertEq(() => [newPtr2.pos(), 1])
    assertEq(() => [result2, SearchResult.Found])

    const aString = SearchSequence.new(Vec.from([
        { searcher: SearchChar.new('"'), flag: SequenceFlag.RequireEnd },
        { searcher: SearchChar.new('a'), flag: SequenceFlag.None },
        { searcher: SearchChar.new('"'), flag: SequenceFlag.End },
    ]))
    const codePtr3 = CodePtr.new(Str.from('"a"'))
    const [newPtr3, result3] = aString.parse(codePtr3)
    assertEq(() => [newPtr3.pos(), 3])
    assertEq(() => [result3, SearchResult.Found])

    const codePtr4 = CodePtr.new(Str.from('"a'))
    const [newPtr4, result4] = aString.parse(codePtr4)
    assertEq(() => [newPtr4.pos(), 2])
    assertEq(() => [result4, SearchResult.NotEnded])
})