import { CodePtr } from '../code-ptr'
import { isOk } from 'src/opt'
import { Searcher, SearchResult } from '../searcher'
import { assertEq, unittest } from 'src/unittest'
import { Str } from 'src/str'

export class SearchCharInRange implements Searcher {
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

    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult] {
        const [ptr, charOpt] = codePtr.next()
      
        return isOk(charOpt) &&
            charOpt.val >= this._from && charOpt.val <= this._to
                ? [ptr, SearchResult.Found]
                : [codePtr, SearchResult.NotFound]
    }
}

unittest(Str.from('SearchStr'), () => {
    const arrow = SearchCharInRange.new('0', '9')
    const codePtr1 = CodePtr.new(Str.from('5'))
    const [newPtr1, isFound] = arrow.parse(codePtr1)
    assertEq(() => [newPtr1.pos(), 1])
    assertEq(() => [isFound, SearchResult.Found])
})
