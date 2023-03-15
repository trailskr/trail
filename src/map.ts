import { Map as ImmMap } from 'immutable'
import { Opt, optFrom } from './opt'

import { Rng } from './rng'
import { Slice } from './slice'

export class Map<K, T> implements Rng<K, T> {
    private readonly _map: ImmMap<K, T>
    
    private constructor(map: ImmMap<K, T>) {
        this._map = map
    }

    static new () {
        return Map.from([])
    }

    static from<K, T>(rec: [key: K, val: T][]): Map<K, T> {
        return new Map(ImmMap(rec))
    }

    left (): Opt<T> {
        return optFrom(this._map.first())
    }

    right (): Opt<T> {
        return optFrom(this._map.last())
    }

    popLeft (): [Map<K, T>, Opt<T>] {
        const last = optFrom(this._map.last())
        const rest = new Map(this._map.skip(1))
        return [rest, last]
    }

    popRight (): [Map<K, T>, Opt<T>] {
        const last = optFrom(this._map.last())
        const rest = new Map(this._map.butLast())
        return [rest, last]
    }

    skipLeft (amount: usize): Map<K, T> {
        return new Map(this._map.skip(amount))
    }

    skipRight (amount: usize): Map<K, T> {
        return new Map(this._map.skipLast(amount))
    }

    slice (fn: (len: usize) => [left: usize, right: usize]): Map<K, T> {
        const len = this.len()
        const slice = Slice.new(len, fn)
        const sliced = this._map.slice(slice.left(), slice.right())
        return new Map(sliced)
    }

    has (item: T): bool {
        return this._map.includes(item)
    }

    includes (rng: Map<K, T>): bool {
        return this._map.isSuperset(rng._map.values())
    }

    get (key: K): Opt<T> {
        return optFrom(this._map.get(key))
    }

    set (key: K, val: T): Map<K, T> {
        return new Map(this._map.set(key, val))
    }

    len (): usize {
        return this._map.size
    }

    every (fn: (item: T, key: K) => bool): bool {
        return this._map.every(fn)
    }

    some (fn: (item: T, key: K) => bool): bool {
        return this._map.some(fn)
    }

    fold<R> (initialValue: R, fn: (acc: R, item: T, key: K, stop: () => void) => R): R {
        let acc = initialValue
        let stop = false
        for (const [index, char] of this._map.entries()) {
            acc = fn(acc, char, index, () => { stop = true })
            if (stop) break
        }
        return acc
    }

    reduce (fn: (a: T, b: T, key: K) => T): T {
        return this._map.reduce(fn)
    }

    map<R> (fn: (val: T, key: K) => R): Map<K, R> {
        const map = this._map.map(fn)
        return new Map(map)
    }

    filter (fn: (val: T, key: K) => bool): Map<K, T> {
        const map = this._map.filter(fn)
        return new Map(map)
    }

    find (fn: (val: T, key: K) => bool): Opt<T> {
        return optFrom(this._map.find(fn))
    }

    findEntry (fn: (val: T, key: K) => bool): Opt<[value: T, key: K]> {
        const entry = this._map.findEntry(fn)
        return optFrom(entry && [entry[1], entry[0]])
    }

    findKey (fn: (val: T, key: K) => bool): Opt<K> {
        return optFrom(this._map.findKey(fn))
    }

    for<R> (fn: (val: T, key: K, stop: () => void) => R): void {
        let stop = false
        for (const [index, char] of this._map.entries()) {
            fn(char, index, () => { stop = true })
            if (stop) break
        }
    }

    inner (): ImmMap<K, T> {
        return this._map
    }

    toString (): string {
        return this._map.toMap().toString()
    }
}
