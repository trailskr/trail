import { CodePtr } from '../code-ptr'
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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        const [ptr, charOpt] = codePtr.next()
        const prevChar = codePtr.getCharBefore()
      
        return (
            isOk(charOpt) && charOpt.val !== this._char
        ) || (
            isNo(prevChar) || prevChar.val === this._escape
        )
            ? [ptr, SearchResult.Found]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchExceptChar'), () => {
    const exceptDoubleQuote = SearchExceptChar.new('"', '\\')

    const codePtr1 = CodePtr.new(Str.from('\\""a'))
    const [codePtr2, result1] = exceptDoubleQuote.parse(codePtr1)
    assertEq(() => [codePtr2.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])
    const [codePtr3, result2] = exceptDoubleQuote.parse(codePtr2)
    assertEq(() => [result2, SearchResult.Found])
    const [_codePtr4, result3] = exceptDoubleQuote.parse(codePtr3)
    assertEq(() => [result3, SearchResult.NotFound])
})