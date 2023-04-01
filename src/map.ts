import { Map as ImmMap } from 'immutable'
import { Opt, optFrom, or } from './opt'
import { RandomAccessFiniteRng } from './rng'

import { Slice } from './slice'

export class Map<K, T> implements RandomAccessFiniteRng<K, T>  {
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

    slice (fn: (len: usize) => Slice<usize>): Map<K, T> {
        const len = this.len()
        const slice = fn(len)
        return new Map(this._map.slice(or(slice.left(), 0), or(slice.right(), len)))
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

    pushRight (val: T): Map<K, T> {
        return new Map(this._map.set(val))
    }

    pushLeft (val: T): Map<K, T> {
        return new Map(this._map.set(val))
    }


    len (): usize {
        return this._map.size
    }

    isEmpty(): bool {
        return this.len() === 0
    }

    inner (): ImmMap<K, T> {
        return this._map
    }

    toString (): string {
        return this._map.toMap().toString()
    }
}
