import { isOk, no, ok, Opt, optFrom } from "./opt"
import { Rng } from "./rng"
import { Slice } from "./slice"
import { Vec } from "./vec"

export class Str implements Rng<usize, char> {
    private readonly _str: string

    private constructor(str: string) {
        this._str = str
    }

    static new<T>(len = 0, init = ' '): Str {
        const str = Array(len).join(init)
        return new Str(str)
    }

    static from (str: string) {
        return new Str(str)
    }

    left (): Opt<char> {
        return optFrom(this._str[0])
    }

    right (): Opt<char> {
        return optFrom(this._str[this._str.length - 1])
    }
    
    popLeft (): [Str, Opt<char>] {
        return [new Str(this._str.slice(1)), this.left()]
    }

    popRight (): [Str, Opt<char>] {
        return [new Str(this._str.slice(0, -1)), this.right()]
    }

    skipLeft (amount: usize): Str {
        return new Str(this._str.slice(0, amount))
    }

    skipRight (amount: usize): Str {
        return new Str(this._str.slice(-amount))
    }

    slice (fn: (len: usize) => [left: usize, right: usize]): Str {
        const len = this.len()
        const slice = Slice.new(len, fn)
        return new Str(this._str.slice(slice.left(), slice.right()))
    }

    has (item: char): bool {
        return isOk(this.find((a) => a === item))
    }

    includes (rng: Str): bool {
        return this._str.includes(rng._str)
    }

    get (index: usize): Opt<char> {
        return optFrom(this._str[index])
    }

    set (index: usize, val: char): Str {
        return Str.from(this._str.slice(0, index) + val + this._str.slice(index))
    }

    len (): usize {
        return this._str.length
    }

    every (fn: (item: string, key: usize) => bool): bool {
        return [...this._str].every(fn)
    }

    some (fn: (item: string, key: usize) => bool): bool {
        return [...this._str].some(fn)
    }

    fold<R> (initialValue: R, fn: (acc: R, item: char, index: usize, stop: () => void) => R): R {
        let acc = initialValue
        let stop = false
        for (const [index, char] of [...this._str].entries()) {
            acc = fn(acc, char, index, () => { stop = true })
            if (stop) break
        }
        return acc
    }

    reduce (fn: (a: char, b: char, index: usize) => char): char {
        return [...this._str].reduce(fn)
    }

    map<R> (fn: (val: char, key: usize) => R): Vec<R> {
        return Vec.from([...this._str].map(fn))
    }

    filter (fn: (val: char, key: usize) => bool): Str {
        return new Str([...this._str].filter(fn).join(''))
    }

    find (fn: (val: char, key: usize) => bool): Opt<char> {
        return optFrom([...this._str].find(fn))
    }

    findEntry (fn: (val: char, key: usize) => bool): Opt<[value: char, key: usize]> {
        const index = [...this._str].findIndex(fn)
        if (index === -1) return no()
        return ok([this._str[index], index])
    }

    findKey (fn: (val: char, key: usize) => bool): Opt<usize> {
        return optFrom([...this._str].findIndex(fn))
    }

    for<R> (fn: (val: char, key: usize, stop: () => void) => R): void {
        let stop = false
        for (const [index, char] of [...this._str].entries()) {
            fn(char, index, () => { stop = true })
            if (stop) break
        }
    }

    pushRight (val: char): Str {
        const str = [...this._str]
        str.push(val)
        return new Str(str.join(''))
    }

    pushLeft (val: char): Str {
        const str = [...this._str]
        str.unshift(val)
        return new Str(str.join(''))
    }

    join (val: Str): Str {
        return Str.from([...this._str].join(val.inner()))
    }

    concat (val: Str): Str {
        return new Str(this._str + val.inner())
    }

    split (regExp: RegExp): Vec<Str> {
        return Vec.from(this._str.split(regExp).map((str) => new Str(str)))
    }

    inner(): string {
        return this._str
    }

    toString(): string {
        return this._str
    }
}