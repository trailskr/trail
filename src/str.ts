import { isOk, no, ok, Opt, optFrom } from "./opt"
import { Rng } from "./rng"
import { Slice } from "./slice"
import { Vec } from "./vec"

export class Str implements Rng<usize, char> {
    private readonly _str: string

    private constructor(str: string) {
        this._str = str
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

    get (index: usize): Opt<char> {
        return optFrom(this._str[index])
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

    fold<R> (initialValue: R, fn: (acc: R, item: char, index: usize) => R): R {
        return [...this._str].reduce<R>(fn, initialValue)
    }

    reduce (fn: (a: char, b: char, index: usize) => char): char {
        return [...this._str].reduce(fn)
    }

    map<R> (fn: (a: char, key: usize) => R): Vec<R> {
        return Vec.from([...this._str].map(fn))
    }

    filter (fn: (a: char, key: usize) => bool): Str {
        return new Str([...this._str].filter(fn).join(''))
    }

    find (fn: (a: char, key: usize) => bool): Opt<[value: char, key: usize]> {
        const index = [...this._str].findIndex(fn)
        if (index === -1) return no()
        return ok([this._str[index], index])
    }

    includes (item: char): bool {
        return isOk(this.find((a) => a === item))
    }

    each<R> (fn: (a: char, key: usize) => R): void {
        [...this._str].forEach(fn)
    }

    slice (slice: Slice): Str {
        return new Str(this._str.slice(slice.left(), slice.right()))
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
        return Str.from([...this._str].join(val.str()))
    }

    concat (val: Str): Str {
        return new Str(this._str + val.str())
    }

    toString (): string {
        return this.str()
    }

    split (regExp: RegExp): Vec<Str> {
        return Vec.from(this._str.split(regExp).map((str) => new Str(str)))
    }

    str(): string {
        return this._str
    }
}