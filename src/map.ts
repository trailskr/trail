import { Map as ImmMap } from 'immutable'
import { Opt, optFrom } from './opt'

import { Rng } from './rng'

export class Map<K, T> implements Rng<K, T> {
    private readonly _map: ImmMap<K, T>
    
    private constructor(rec: [key: K, val: T][]) {
        this._map = ImmMap(rec)
    }

    static new () {
        return new Map([])
    }

    left (): Opt<T> {
        return optFrom(this._map.first())
    }

    right (): Opt<T> {
        return optFrom(this._map.last())
    }

    popLeft (): [Map<K, T>, Opt<T>] {
        const [first, ...rest] = this._map
        return [Map.new(rest), first[1]]
    }

    popRight (): [Map<K, T>, Opt<T>] {
        const [...all] = this._map
        return [Map.new(all.slice(1)), all[all.length - 1] as Opt<T>]
    }

    get (key: K): Opt<T> {
        return this._map.get(key)
    }

    len (): usize {
        return this._map.size
    }

    every (fn: (item: T, key: K) => bool): bool {
        return [...this._map.entries()].every(([key, val]) => fn(val, key))
    }

    some (fn: (item: T, key: K) => bool): bool {
        return [...this._map.entries()].some(([key, val]) => fn(val, key))
    }

    fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R {
        return [...this._map.values()].reduce<R>(fn, initialValue)
    }

    reduce (fn: (a: T, b: T, index: usize) => T): T {
        return [...this._map.values()].reduce(fn)
    }

    map<R> (fn: (a: T, key: K) => R): Map<K, R> {
        const entries = [...this._map.entries()].map(([key, val]) => {
            return [key, fn(val, key)] as [K, R]
        })
        return Map.new(entries)
    }

    filter (fn: (a: T, key: K) => bool): Map<K, T> {
        return Map.new([...this._map.entries()].filter(([key, val]) => fn(val, key)))
    }

    find (fn: (a: T, key: K) => bool): [value: T, key: K] | Und {
        const entry = [...this._map.entries()].find(([key, val]) => fn(val, key))
        return entry === und ? und : [entry[1], entry[0]]
    }

    includes (item: T): bool {
        return this.find((a) => a === item) != und
    }

    each<R> (fn: (a: T, key: K) => R): void {
        return this._map.forEach(fn)
    }

    slice (start: Opt<usize>, end: Opt<usize>): Map<K, T> {
        return Map.new([...this._map.entries()].slice(start!, end!))
    }

    set (key: K, val: T): Map<K, T> {
        const newMap = Map.new([...this._map])
        newMap.set(key, val)
        return newMap
    }

    _ (): globalThis.Map<K, T> {
        return this._map
    }

    valueOf (): globalThis.Map<K, T> {
        return this._()
    }

    toString (): globalThis.Map<K, T> {
        return this._()
    }
}
