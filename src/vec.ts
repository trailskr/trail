import { List } from 'immutable'
import { no, ok, Opt, optFrom, isOk } from './opt'

import { Rng } from "./rng"
import { Slice } from './slice'
import { Str } from './str'

export class Vec<T> implements Rng<usize, T> {
    private readonly _arr: List<T>

    private constructor(list: List<T>) {
        this._arr = list
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

    popLeft(): [Rng<usize, T>, Opt<T>] {
        const first = optFrom(this._arr.first())
        const rest = new Vec(this._arr.shift())
        return [rest, first]
    }

    popRight (): [Rng<usize, T>, Opt<T>] {
        const last = optFrom(this._arr.last())
        const rest = new Vec(this._arr.pop())
        return [rest, last]
    }

    get (index: usize): Opt<T> {
        return optFrom(this._arr.get(index))
    }

    len (): usize {
        return this._arr.size
    }

    every (fn: (item: T, key: usize) => bool): bool {
        return this._arr.every(fn)
    }

    some (fn: (item: T, key: usize) => bool): bool {
        return this._arr.some(fn)
    }

    fold <R>(initialValue: R, fn: (acc: R, item: T, index: usize) => R): R {
        return this._arr.reduce<R>(fn, initialValue)
    }

    reduce (fn: (a: T, b: T, index: usize) => T): T {
        return this._arr.reduce(fn)
    }

    map <R>(fn: (a: T, key: usize) => R): Vec<R> {
        return new Vec(this._arr.map(fn))
    }

    filter (fn: (a: T, key: usize) => bool): Vec<T> {
        return new Vec(this._arr.filter(fn))
    }

    find (fn: (a: T, key: usize) => bool): Opt<[value: T, key: usize]> {
        const entry = this._arr.findEntry(fn)
        if (entry === undefined) return no()
        const [key, value] = entry
        return ok([value, key])
    }

    includes (item: T): bool {
        return isOk(this.find((a) => a === item))
    }

    each<R> (fn: (a: T, key: usize) => R): void {
        this._arr.forEach(fn)
    }

    slice (slice: Slice): Vec<T> {
        return new Vec(this._arr.slice(slice.left(), slice.right()))
    }

    pushRight (val: T): Vec<T> {
        return new Vec(this._arr.push(val))
    }

    pushLeft (val: T): Vec<T> {
        return new Vec(this._arr.unshift(val))
    }

    join (val: Str): Str {
        return Str.from(this._arr.join(val.str()))
    }

    concat (val: Vec<T>): Vec<T> {
        return new Vec(this._arr.concat(val._arr))
    }

    toString (): Str {
        return Str.from(this._arr.toArray().toString())
    }

    arr(): T[] {
        return this._arr.toArray()
    }
}
