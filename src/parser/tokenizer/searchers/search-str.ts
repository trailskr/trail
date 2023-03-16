import { CodePtr } from '../code-ptr'
import { isNo } from 'src/opt'
import { Str } from 'src/str'
import { assertEq, unittest } from 'src/unittest'
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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        const newPtr = this._str.fold(codePtr, (ptr, strChar, _, stop) => {
            const [newPtr, charOpt] = ptr.next()
            if (isNo(charOpt) || strChar !== charOpt.val) {
                stop()
                return codePtr
            }
            return newPtr
        })
      
        return newPtr != codePtr
            ? [newPtr, SearchResult.Found]
            : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchStr'), () => {
    const arrow = SearchStr.new(Str.from('\r\n'))
    const codePtr1 = CodePtr.new(Str.from('\r\n'))
    const [newPtr1, isFound] = arrow.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 2])
    assertEq(() => [isFound, SearchResult.Found])
})