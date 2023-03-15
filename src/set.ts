import { Set as ImmSet } from 'immutable'
import { Opt, optFrom } from './opt'

import { SetRng } from './rng'
import { Slice } from './slice'
import { Str } from './str'

export class Set<T> implements SetRng<T, T> {
    private readonly _set: ImmSet<T>
    
    private constructor(set: ImmSet<T>) {
        this._set = set
    }

    static new () {
        return Set.from([])
    }

    static from<T>(rec: T[]): Set<T> {
        return new Set(ImmSet(rec))
    }

    left (): Opt<T> {
        return optFrom(this._set.first())
    }

    right (): Opt<T> {
        return optFrom(this._set.last())
    }

    popLeft (): [Set<T>, Opt<T>] {
        const last = optFrom(this._set.last())
        const rest = new Set(this._set.skip(1))
        return [rest, last]
    }

    popRight (): [Set<T>, Opt<T>] {
        const last = optFrom(this._set.last())
        const rest = new Set(this._set.butLast())
        return [rest, last]
    }

    skipLeft (amount: usize): Set<T> {
        return new Set(this._set.skip(amount))
    }

    skipRight (amount: usize): Set<T> {
        return new Set(this._set.skipLast(amount))
    }

    slice (fn: (len: usize) => [left: usize, right: usize]): Set<T> {
        const len = this.len()
        const slice = Slice.new(len, fn)
        const sliced = this._set.slice(slice.left(), slice.right())
        return new Set(sliced)
    }

    len (): usize {
        return this._set.size
    }

    has (item: T): bool {
        return this._set.includes(item)
    }

    includes (rng: Set<T>): bool {
        return this._set.isSuperset(rng._set)
    }

    every (fn: (item: T) => bool): bool {
        return this._set.every(fn)
    }

    some (fn: (item: T) => bool): bool {
        return this._set.some(fn)
    }

    fold<R> (initialValue: R, fn: (acc: R, item: T, stop: () => void) => R): R {
        let acc = initialValue
        let stop = false
        for (const item of this._set) {
            acc = fn(acc, item, () => { stop = true })
            if (stop) break
        }
        return acc
    }

    reduce (fn: (a: T, b: T) => T): T {
        return this._set.reduce(fn)
    }

    map<R> (fn: (val: T) => R): Set<R> {
        const set = this._set.map(fn)
        return new Set(set)
    }

    filter (fn: (val: T) => bool): Set<T> {
        const set = this._set.filter(fn)
        return new Set(set)
    }

    find (fn: (val: T) => bool): Opt<T> {
        return optFrom(this._set.find(fn))
    }

    for<R> (fn: (val: T, stop: () => void) => R): void {
        let stop = false
        for (const item of this._set) {
            fn(item, () => { stop = true })
            if (stop) break
        }
    }

    inner (): ImmSet<T> {
        return this._set
    }

    toString (): string {
        return this._set.toSet().toString()
    }
}
