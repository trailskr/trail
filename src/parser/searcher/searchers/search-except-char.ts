import { CharStream } from '../../lexer/char-stream'
import { isNo, isOk } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult } from '../searcher'

export class SearchExceptChar implements Searcher {
    private readonly _char: char
    private readonly _escape: char

    private constructor (char: char, escape: char) {
        this._char = char
        this._escape = escape
    }
    
    static new (char: char, escape: char): SearchExceptChar {
        return new SearchExceptChar(char, escape)
    }

    char(): char {
        return this._char
    }

    escape(): char {
        return this._escape
    }

    parse(charStream: CharStream): [newCharStream: CharStream, result: SearchResult] {
        const [ptr, charOpt] = charStream.popLeft()
        const prevChar = charStream.getCharBefore()
      
        return (
            isOk(charOpt) && charOpt.val !== this._char
        ) || (
            isNo(prevChar) || prevChar.val === this._escape
        )
            ? [ptr, SearchResult.Found]
            : [charStream, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchExceptChar'), () => {
    const exceptDoubleQuote = SearchExceptChar.new('"', '\\')

    const charStream1 = CharStream.new(Str.from('\\""a'))
    const [charStream2, result1] = exceptDoubleQuote.parse(charStream1)
    assertEq(() => [charStream2.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])
    const [charStream3, result2] = exceptDoubleQuote.parse(charStream2)
    assertEq(() => [result2, SearchResult.Found])
    const [_charStream4, result3] = exceptDoubleQuote.parse(charStream3)
    assertEq(() => [result3, SearchResult.NotFound])
})