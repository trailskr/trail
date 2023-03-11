import { assertInc, unittest } from './unittest'

class CodeIterator {
    private readonly _code: string
    private readonly _pos: usize = 0
    private readonly _col: usize = 1
    private readonly _row: usize = 1
    private readonly _charIter: Iterator<char>

    constructor (code: string, charIter: Iterator<char> = code[Symbol.iterator]()) {
        this._code = code
        this._charIter = charIter
    }

    code (): string {
        return this._code
    }

    pos (): usize {
        return this._pos
    }

    col (): usize {
        return this._col
    }

    row (): usize {
        return this._row
    }

    next(): IteratorResult<CodeIterator> {
        const res = this._charIter.next()
        if (!res.done) return { value: new CodeIterator(this._code, this._charIter), done: res.done }
        this._pos += 1
        if (res.value === '\n') {
            this._row += 1
        } else {
            this._col += 1
        }
        return res
    }
}

const isWhiteSpace = (char: char): bool => {
    return char === ' '
}

const inRange = (char: char, from: char, to: char): bool => {
    return char >= from && char <= to
}

interface Indent { type: 'Indent', size: usize }
interface LineEnd { type: 'LineEnd' }

type Token = Indent | LineEnd

interface TokenError {
    type: 'TokenError'
    msg: string
}
type TokenResult = Token | TokenError

class TokenStream {
    _src: string

    constructor(src: string) {
        this._src = src
    }

    src(): string {
        return this._src
    }

    [Symbol.iterator](): IterableIterator<TokenResult> {
        const codePtr = new CodeIterator(this._src)
        let isIndentMatch = true
        return {
            [Symbol.iterator](): IterableIterator<TokenResult> {
                return this
            },
            next: (..._args: []): IteratorResult<TokenResult> => {
                let res = codePtr.next()
                if (isIndentMatch) {
                    let count = 0
                    while (!res.done && isWhiteSpace(res.value)) {
                        res = codePtr.next()
                        count += 1
                    }
                    if (count > 0) {
                        if (count % 4 !== 0) {
                            return {
                                value: {
                                    type: 'TokenError',
                                    msg: 'indent spaces must be multiple by 4',
                                    codePtr
                                },
                                done: res.done
                            }
                        }
                        isIndentMatch = false
                        return { value: { type: 'Indent', size: count / 4 }, done: res.done }
                    }
                }
                if (res.done) {
                    return { done: true, value: { type: 'Indent' } }
                } else {
                    return { done: false, value: { type: 'Indent' } }
                }
            }
        }
    }
}

const t = [][Symbol.iterator]

unittest('sample test', () => {
    const ts = new TokenStream('a = a + 1')
    assertInc(() => [{a: 1, b: 2}, {a: 1}])
})
