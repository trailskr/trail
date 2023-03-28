import { CharStream } from '../../lexer/char-stream'
import { isOk } from 'src/opt'
import { Searcher, SearchResult, SearchResultType } from '../searcher'
import { assertEq, unittest } from 'src/unittest'
import { Str } from 'src/str'

export class SearchCharInRange implements Searcher<char, char, CharStream> {
    private readonly _from: char
    private readonly _to: char

    private constructor (from: char, to: char) {
        this._from = from
        this._to = to
    }
    
    static new (from: char, to: char): SearchCharInRange {
        return new SearchCharInRange(from, to)
    }

    from(): char {
        return this._from
    }

    to(): char {
        return this._to
    }

    search(charStream: CharStream): [newCharStream: CharStream, result: SearchResult<char>] {
        const [ptr, charOpt] = charStream.popLeft()
      
        return isOk(charOpt) &&
            charOpt.val >= this._from && charOpt.val <= this._to
                ? [ptr, { type: SearchResultType.Found, val: charOpt.val }]
                : [charStream, { type: SearchResultType.NotFound }]
    }
}

unittest(Str.from('SearchStr'), () => {
    const arrow = SearchCharInRange.new('0', '9')

    const charStream1 = CharStream.new(Str.from('5'))
    const [newCharStream1, result1] = arrow.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1.type, SearchResultType.Found])

    const charStream2 = CharStream.new(Str.from('_'))
    const [newCharStream2, result2] = arrow.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2.type, SearchResultType.NotFound])
})
