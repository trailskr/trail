import { CharStream } from '../../lexer/char-stream'
import { isOk } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'

export class SearchChar implements Searcher {
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

    parse(charStream: CharStream): [newCharStream: CharStream, result: SearchResult] {
        const [ptr, charOpt] = charStream.popLeft()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [ptr, SearchResult.Found]
            : [charStream, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchChar'), () => {
    const arrow = SearchChar.new('+')

    const charStream1 = CharStream.new(Str.from('+'))
    const [newCharStream1, result1] = arrow.parse(charStream1)
    assertEq(() => [newCharStream1.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])

    const charStream2 = CharStream.new(Str.from('-'))
    const [newCharStream2, result2] = arrow.parse(charStream2)
    assertEq(() => [newCharStream2.pos(), 0])
    assertEq(() => [result2, SearchResult.NotFound])
})