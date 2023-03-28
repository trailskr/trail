import { CharStream } from '../../lexer/char-stream'
import { isOk } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult, SearchResultType } from '../searcher'

export class SearchChar implements Searcher<char, char, CharStream> {
    private readonly _char: char

    private constructor (char: char) {
        this._char = char
    }
    
    static new (char: char): SearchChar {
        return new SearchChar(char)
    }

    char(): char {
        return this._char
    }

    search(charStream: CharStream): [newCharStream: CharStream, result: SearchResult<char>] {
        const [newCharStream, charOpt] = charStream.popLeft()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [newCharStream, { type: SearchResultType.Found, val: charOpt.val }]
            : [charStream, { type: SearchResultType.NotFound }]
    }
}

unittest(Str.from('SearchChar'), () => {
    const arrow = SearchChar.new('+')

    const charStream1 = CharStream.new(Str.from('+'))
    const [newCharStream1, result1] = arrow.search(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1.type, SearchResultType.Found])

    const charStream2 = CharStream.new(Str.from('-'))
    const [newCharStream2, result2] = arrow.search(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2.type, SearchResultType.NotFound])
})