import { Rng, Str } from '.'

export class Vec<T> implements Rng<usize, T>  {
    private readonly _arr: T[]

    constructor (arrOrSize: T[] | usize) {
        if (Array.isArray(arrOrSize)) {
            this._arr = arrOrSize
        } else {
            this._arr = [...new Array(arrOrSize)]
        }
    }

    static new<T> (arr: T[] = []): Vec<T> {
        return new Vec<T>(arr)
    }

    static len<T> (len: usize): Vec<T> {
        return new Vec<T>(len)
    }

    popLeft (): [Vec<T>, T | Und] {
        const [first, ...rest] = this._arr
        return [Vec.new(rest), first]
    }

    popRight (): [Vec<T>, T | Und] {
        const last = this._arr[this._arr.length - 1]
        return [Vec.new(this._arr.slice(1)), last as T | Und]
    }

    pop (): [Vec<T>, T | Und] {
        return this.popRight()
    }

    left (): T | Und {
        return this._arr[0]
    }

    right (): T | Und {
        return this._arr[this._arr.length - 1]
    }

    at (key: usize): T | Und {
        return this._arr[key]
    }

    len (): usize {
        return this._arr.length
    }

    every (fn: (item: T, key: usize) => bool): bool {
        return this._arr.every(fn)
    }

    some (fn: (item: T, key: usize) => bool): bool {
        return this._arr.some(fn)
    }

    fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R {
        return this._arr.reduce<R>(fn, initialValue)
    }

    reduce (fn: (a: T, b: T, index: usize) => T): T {
        return this._arr.reduce(fn)
    }

    map<R> (fn: (a: T, key: usize) => R): Vec<R> {
        return Vec.new(this._arr.map(fn))
    }

    filter (fn: (a: T, key: usize) => bool): Vec<T> {
        return Vec.new(this._arr.filter(fn))
    }

    find (fn: (a: T, key: usize) => bool): [value: T, key: usize] | Und {
        const key = this._arr.findIndex(fn)
        return key === -1 ? und : [this._arr[key], key]
    }

    includes (item: T): bool {
        return this.find((a) => a === item) != und
    }

    each<R> (fn: (a: T, key: usize) => R): Und {
        return this._arr.forEach(fn)
    }

    slice (start: usize | Und, end: usize | Und): Vec<T> {
        return Vec.new(this._arr.slice(start!, end!))
    }

    push (val: T): Vec<T> {
        return Vec.new([...this._arr, val])
    }

    join (val: Str): Str {
        return Str.new(this._arr.join(val._()))
    }

    concat (val: Vec<T>): Vec<T> {
        return Vec.new([...this._arr, ...val._()])
    }

    _ (): T[] {
        return this._arr
    }

    valueOf (): T[] {
        return this._()
    }

    toString (): T[] {
        return this._()
    }
}
