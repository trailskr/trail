import { Rng, Vec } from '.'

export class Str implements Rng<usize, char> {
    private _str: string

    constructor (str: string) {
        this._str = str
    }

    static new (str: string): Str {
        return new Str(str)
    }

    popLeft (): [Str, char | Und] {
        return [Str.new(this._str.slice(1)), this._str[0]]
    }

    popRight (): [Str, char | Und] {
        const last = this._str[this._str.length - 1]
        return [Str.new(this._str.slice(1)), last as char | Und]
    }

    pop (): [Str, char | Und] {
        return this.popRight()
    }

    left (): char | Und {
        return this._str[0]
    }

    at (key: usize): char | Und {
        return this._str[key]
    }

    right (): char | Und {
        return this._str[this._str.length - 1]
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
        return Vec.new([...this._str].map(fn))
    }

    filter (fn: (a: char, key: usize) => bool): Str {
        return Str.new([...this._str].filter(fn).join(''))
    }

    find (fn: (a: char, key: usize) => bool): [value: char, key: usize] | Und {
        const key = [...this._str].findIndex(fn)
        return key === -1 ? und : [this._str[key], key]
    }

    includes (item: char): bool {
        return this.find((a) => a === item) != und
    }

    for<R> (fn: (a: char, key: usize) => R): Und {
        [...this._str].forEach(fn)
    }

    slice (start: usize | Und, end: usize | Und): Str {
        return Str.new([...this._str].slice(start!, end!).join(''))
    }

    concat (val: Str): Str {
        return Str.new(this._str + val._())
    }

    _ (): string {
        return this._str
    }

    split (regExp: RegExp): Vec<Str> {
        return Vec.new(this._str.split(regExp).map((str) => Str.new(str)))
    }
}
