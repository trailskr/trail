import { Rng } from '.'

export class Vec<T> implements Rng<usize, T>  {
    private _arr: T[]

    constructor (arr: T[]) {
        this._arr = arr
    }

    static new<T> (arr: T[]): Vec<T> {
        return new Vec<T>(arr)
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

    all (fn: (item: T, key: usize) => bool): bool {
        return this._arr.every(fn)
    }

    fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R {
        return this._arr.reduce<R>(fn, initialValue)
    }

    reduce (fn: (a: T, b: T, index: usize) => T): T {
        return this._arr.reduce(fn)
    }

    push (val: T): Vec<T> {
        return Vec.new([...this._arr, val])
    }

    internal (): T[] {
        return this._arr
    }
}
