import { CharStream } from '../../parser/lexer/char-stream'
import { Str } from 'src_old2/str'
import { assertEq, unittest } from 'src_old3/unittest'
import { Searcher, SearchResult } from '../searcher'
import { isNo, isOk, no, ok, Opt } from 'src_old2/opt'
import { Slice } from 'src_old2/slice'
import { InpLeftRng } from 'src_old2/rng'
import { SearchOne } from './search-one'
import { Vec } from 'src_old2/vec'

export class SearchRepeat<T> implements Searcher<T, Vec<T>> {
    private readonly _searcher: Searcher<T, T>
    private readonly _slice: Slice

    private constructor(searcher: Searcher<T, T>, slice: Slice) {
        this._searcher = searcher
        this._slice = slice
    }

    static new<T>(searcher: Searcher<T, T>, slice: Slice): SearchRepeat<T> {
        return new SearchRepeat(searcher, slice)
    }

    searcher(): Searcher<T, T> {
        return this._searcher
    }

    search<R extends InpLeftRng<T>>(from: R): [newRng: R, result: Opt<SearchResult<T, Vec<T>>>] {
        const iterate = (curRng: R, curResult: Vec<T>): [newRng: R, result: Opt<SearchResult<T, Vec<T>>>] => {
            const [newRng, result] = this._searcher.search(curRng)
            if (isNo(result)) {
                if (curResult.isEmpty()) {
                    return [from, no<SearchResult<T, Vec<T>>>()]
                }
                const sliceLeft = this._slice.left()
                if (isNo(sliceLeft) || curResult.len() >= sliceLeft.val) {
                    return [newRng as R, ok({ type: SearchResult.Type.Found, val: curResult, from, to: newRng as R })]
                }
                return [from, ok({ type: SearchResult.Type.NotFound })]
            }
            if (result.val.type !== SearchResult.Type.Found) {
                const sliceLeft = this._slice.left()
                if (isNo(sliceLeft) || curResult.len() >= sliceLeft.val) {
                    return [newRng as R, ok({ type: SearchResult.Type.Found, val: curResult, from, to: newRng as R })]
                }
                return [from, ok({ type: SearchResult.Type.NotFound })]
            }
            const newResult = curResult.pushRight(result.val.val)
            const sliceRight = this._slice.right()
            if (isOk(sliceRight) && sliceRight.val === newResult.len()) {
                return [newRng as R, ok({ type: SearchResult.Type.Found, val: newResult, from, to: newRng as R })]
            }
            return iterate(newRng as R, newResult)
        }

        return iterate(from, Vec.new())
    }
}

unittest(Str.from('SearchRepeat'), () => {
    const spacesFrom2 = SearchRepeat.new(SearchOne.new(' '), Slice.new(ok(2), no()))

    const charStream1 = CharStream.new(Str.from('    '))
    const [newCharStream1, result1] = spacesFrom2.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 4])
    assertEq(() => [result1, ok<SearchResult<char, Vec<char>>>({
        type: SearchResult.Type.Found,
        val: Vec.from([' ', ' ', ' ', ' ']),
        from: charStream1,
        to: newCharStream1
    })])

    const charStream2 = CharStream.new(Str.from(' '))
    const [newCharStream2, result2] = spacesFrom2.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2, ok({ type: SearchResult.Type.NotFound })])

    const spacesTo5 = SearchRepeat.new(SearchOne.new(' '), Slice.new(no(), ok(5)))

    const charStream3 = CharStream.new(Str.from('         '))
    const [newCharStream3, result3] = spacesTo5.search(charStream3)
    assertEq(() => [newCharStream3.pos(), 5])
    assertEq(() => [result3, ok<SearchResult<char, Vec<char>>>({
        type: SearchResult.Type.Found,
        val: Vec.from([' ', ' ', ' ', ' ', ' ']),
        from: charStream3,
        to: newCharStream3
    })])

    const charStream4 = CharStream.new(Str.from(''))
    const [newCharStream4, result4] = spacesFrom2.search(charStream4)
    assertEq(() => [newCharStream4.pos(), 0])
    assertEq(() => [result4, no()])

    const charStream5 = CharStream.new(Str.from(' '))
    const [newCharStream5, result5] = spacesFrom2.search(charStream5)
    assertEq(() => [newCharStream5.pos(), 0])
    assertEq(() => [result5, ok({ type: SearchResult.Type.NotFound })])
})
