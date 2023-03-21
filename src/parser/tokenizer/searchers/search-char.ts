import { CodePtr } from '../code-ptr'
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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        const [ptr, charOpt] = codePtr.popLeft()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [ptr, SearchResult.Found]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchChar'), () => {
    const arrow = SearchChar.new('+')

    const codePtr1 = CodePtr.new(Str.from('+'))
    const [newPtr1, result1] = arrow.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 1])
    assertEq(() => [result1, SearchResult.Found])

    const codePtr2 = CodePtr.new(Str.from('-'))
    const [newPtr2, result2] = arrow.parse(codePtr2)
    assertEq(() => [newPtr2.pos(), 0])
    assertEq(() => [result2, SearchResult.NotFound])
})