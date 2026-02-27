import { CharStream } from '../../parser/lexer/char-stream'
import { isNo } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src_old3/unittest'
import { Searcher, SearchResult } from '../searcher'

export class SearchStr implements Searcher {
    private readonly _str: Str

    private constructor (str: Str) {
        this._str = str
    }

    static new (str: Str): SearchStr {
        return new SearchStr(str)
    }

    str(): Str {
        return this._str
    }

    parse(charStream: CharStream): [newCharStream: CharStream, result: SearchResult] {
        const newCharStream = this._str.fold(charStream, (ptr, strChar, _, stop) => {
            const [newCharStream, charOpt] = ptr.popLeft()
            if (isNo(charOpt) || strChar !== charOpt.val) {
                stop()
                return charStream
            }
            return newCharStream
        })

        return newCharStream != charStream
            ? [newCharStream, SearchResult.Found]
            : [charStream, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchStr'), () => {
    const arrow = SearchStr.new(Str.from('\r\n'))

    const charStream1 = CharStream.new(Str.from('\r\n'))
    const [newCharStream1, result1] = arrow.parse(charStream1)
    assertEq(() => [newCharStream1.pos(), 2])
    assertEq(() => [result1, SearchResult.Found])

    const charStream2 = CharStream.new(Str.from('asd5'))
    const [newCharStream2, result2] = arrow.parse(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2, SearchResult.NotFound])
})
