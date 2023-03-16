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
        const [ptr, charOpt] = codePtr.next()
      
        return isOk(charOpt) && charOpt.val === this._char
            ? [ptr, SearchResult.Found]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchChar'), () => {
    const arrow = SearchChar.new('+')
    const codePtr1 = CodePtr.new(Str.from('+'))
    const [newPtr1, isFound] = arrow.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 1])
    assertEq(() => [isFound, SearchResult.Found])
})