import { CharStream } from '../../parser/lexer/char-stream'
import { isNo, isOk } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
import { Searcher, SearchResult, SearchResultType } from '../searcher'

export class SearchExceptChar implements Searcher<char, char, CharStream> {
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

    search(charStream: CharStream): [newCharStream: CharStream, result: SearchResult<char>] {
        const [ptr, charOpt] = charStream.popLeft()
        const prevChar = charStream.getCharBefore()
      
        return (
            isOk(charOpt) && charOpt.val !== this._char
        ) || (
            isNo(prevChar) || prevChar.val === this._escape
        )
            ? [ptr, { type: SearchResultType.Found, val: charOpt.val }]
            : [charStream, { type: SearchResultType.NotFound }]
    }
}

unittest(Str.from('SearchExceptChar'), () => {
    const exceptDoubleQuote = SearchExceptChar.new('"', '\\')

    const charStream1 = CharStream.new(Str.from('\\""a'))
    const [charStream2, result1] = exceptDoubleQuote.parse(charStream1)
    assertEq(() => [charStream2.pos(), 1])
    assertEq(() => [result1, SearchResultType.Found])
    const [charStream3, result2] = exceptDoubleQuote.parse(charStream2)
    assertEq(() => [result2, SearchResultType.Found])
    const [_charStream4, result3] = exceptDoubleQuote.parse(charStream3)
    assertEq(() => [result3, SearchResultType.NotFound])
})