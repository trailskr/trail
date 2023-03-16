import { List } from 'immutable'
import { no, ok, Opt, optFrom, isOk, or } from './opt'

import { Rng } from "./rng"
import { Slice } from './slice'
import { Str } from './str'

export class Vec<T> implements Rng<usize, T> {
    private readonly _arr: List<T>

    private constructor(list: List<T>) {
        this._arr = list
    }

    static new<T>(len = 0, init = 0): Vec<T> {
        const arr = Array(len)
        for (let i = 0; i < len; i++) {
            arr[i] = init
        }
        return new Vec(List(arr))
    }

    static from<T>(arr: T[]): Vec<T> {
        return new Vec(List(arr))
    }

    left(): Opt<T> {
        return optFrom(this._arr.get(0))
    }

    right(): Opt<T> {
        return optFrom(this._arr.get(this.len() - 1))
    }

    popLeft(): [Vec<T>, Opt<T>] {
        const first = optFrom(this._arr.first())
        const rest = new Vec(this._arr.shift())
        return [rest, first]
    }

    popRight (): [Vec<T>, Opt<T>] {
        const last = optFrom(this._arr.last())
        const rest = new Vec(this._arr.pop())
        return [rest, last]
    }

    skipLeft (amount: usize): Vec<T> {
        return new Vec(this._arr.skip(amount))
    }

    skipRight (amount: usize): Vec<T> {
        return new Vec(this._arr.skipLast(amount))
    }

    slice (fn: (len: usize) => Slice<usize>): Vec<T> {
        const len = this.len()
        const slice = fn(len)
        return new Vec(this._arr.slice(or(slice.left(), 0), or(slice.right(), len)))
    }

    len (): usize {
        return this._arr.size
    }

    has (item: T): bool {
        return isOk(this.find((a) => a === item))
    }

    includes (rng: Vec<T>): bool {
        return this._arr.isSuperset(rng._arr)
    }

    get (index: usize): Opt<T> {
        return optFrom(this._arr.get(index))
    }

    set (index: usize, val: T): Vec<T> {
        return new Vec(this._arr.set(index, val))
    }

    every (fn: (item: T, key: usize) => bool): bool {
        return this._arr.every(fn)
    }

    some (fn: (item: T, key: usize) => bool): bool {
        return this._arr.some(fn)
    }

    fold <R>(initialValue: R, fn: (acc: R, item: T, key: usize, stop: () => void) => R): R {
        let acc = initialValue
        let stop = false
        for (const [index, char] of this._arr.entries()) {
            acc = fn(acc, char, index, () => { stop = true })
            if (stop) break
        }
        return acc
    }

    reduce (fn: (acc: T, b: T, key: usize) => T): T {
        return this._arr.reduce(fn)
    }

    map <R>(fn: (val: T, key: usize) => R): Vec<R> {
        return new Vec(this._arr.map(fn))
    }

    filter (fn: (val: T, key: usize) => bool): Vec<T> {
        return new Vec(this._arr.filter(fn))
    }

    find (fn: (val: T, key: usize) => bool): Opt<T> {
        return optFrom(this._arr.find(fn))
    }

    findEntry (fn: (aval: T, key: usize) => bool): Opt<[value: T, key: usize]> {
        const entry = this._arr.findEntry(fn)
        if (entry === undefined) return no()
        const [key, value] = entry
        return ok([value, key])
    }

    findKey (fn: (val: T, key: usize) => bool): Opt<usize> {
        return optFrom(this._arr.findIndex(fn))
    }

    for<R> (fn: (val: T, key: usize, stop: () => void) => R): void {
        let stop = false
        for (const [index, char] of this._arr.entries()) {
            fn(char, index, () => { stop = true })
            if (stop) break
        }
    }

    pushRight (val: T): Vec<T> {
        return new Vec(this._arr.push(val))
    }

    pushLeft (val: T): Vec<T> {
        return new Vec(this._arr.unshift(val))
    }

    join (val: Str): Str {
        return Str.from(this._arr.join(val.inner()))
    }

    concat (val: Vec<T>): Vec<T> {
        return new Vec(this._arr.concat(val._arr))
    }

    inner(): T[] {
        return this._arr.toArray()
    }

    toString (): string {
        return this._arr.toArray().toString()
    }
}
