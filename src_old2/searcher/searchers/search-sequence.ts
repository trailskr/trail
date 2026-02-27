import { CharStream } from '../../parser/lexer/char-stream'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src_old3/unittest'
import { Searcher, SearchResult } from '../searcher'
import { Vec } from 'src/vec'
import { SearchChar } from './search-one'
import { Opt } from 'src/opt'
import { InpLeftRng } from 'src/rng'

export enum SequenceFlag {
    None = 'None',
    Optional = 'Optional',
    RequireEnd = 'RequireEnd',
    End = 'End',
}

export interface SequenceItem<T, U> {
    key: Str,
    searcher: Searcher<T, U>,
    flag: SequenceFlag
}

export class SearchSequence<T> implements Searcher<T> {
    private readonly _items: Vec<SequenceItem>

    private constructor(items: Vec<SequenceItem>) {
        this._items = items
    }

    static new<T>(items: Vec<SequenceItem>): SearchSequence<T> {
        return new SearchSequence(items)
    }

    items(): Vec<SequenceItem> {
        return this._items
    }

    search<R extends InpLeftRng<T>>(from: R): [newRng: R, result: Opt<SearchResult<T>>] {
        /// isEndend is false when was SequenceFlag.RequreEnd item and was't SequenceFlag.End
        const [newRng, isEnded] = this._items.fold(
            [from, true] as [CharStream, bool],
            ([ptr, isEnded], { searcher, flag }, _, stop) => {
                const [newRng, result] = searcher.parse(ptr)
                if (result !== SearchResult.Type.Found && flag !== SequenceFlag.Optional) {
                    stop()
                    return [isEnded ? from : newRng, isEnded] as [CharStream, bool]
                }
                const newIsEnded = flag === SequenceFlag.RequireEnd
                    ? false
                    : isEnded || flag === SequenceFlag.End
                return [newRng, newIsEnded] as [CharStream, bool]
            }
        )

        return newRng != from
            ? isEnded
                ? [newRng, SearchResult.Type.Found]
                : [newRng, SearchResult.Type.Error]
            : [from, SearchResult.Type.NotFound]
    }
}

unittest(Str.from('SearchSequence'), () => {
    const lineEnd = SearchSequence.new(Vec.from([
        { searcher: SearchChar.new('\r'), flag: SequenceFlag.Optional },
        { searcher: SearchChar.new('\n'), flag: SequenceFlag.None },
    ]))

    const charStream1 = CharStream.new(Str.from('\r\n'))
    const [newCharStream1, result1] = lineEnd.parse(charStream1)
    assertEq(() => [newCharStream1.pos(), 2])
    assertEq(() => [result1, SearchResult.Type.Found])

    const charStream2 = CharStream.new(Str.from('\n'))
    const [newCharStream2, result2] = lineEnd.parse(charStream2)
    assertEq(() => [newCharStream2.pos(), 1])
    assertEq(() => [result2, SearchResult.Type.Found])

    const aString = SearchSequence.new(Vec.from([
        { searcher: SearchChar.new('"'), flag: SequenceFlag.RequireEnd },
        { searcher: SearchChar.new('a'), flag: SequenceFlag.None },
        { searcher: SearchChar.new('"'), flag: SequenceFlag.End },
    ]))
    const charStream3 = CharStream.new(Str.from('"a"'))
    const [newCharStream3, result3] = aString.parse(charStream3)
    assertEq(() => [newCharStream3.pos(), 3])
    assertEq(() => [result3, SearchResult.Type.Found])

    const charStream4 = CharStream.new(Str.from('"a'))
    const [newCharStream4, result4] = aString.parse(charStream4)
    assertEq(() => [newCharStream4.pos(), 2])
    assertEq(() => [result4, SearchResult.Type.Error])
})
