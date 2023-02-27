import { Rng } from '.'

export class Map<K, T> implements Rng<T, K> {
    private _map: globalThis.Map<K, T>

    constructor (map: [key: K, val: T][]) {
        this._map = new globalThis.Map<K, T>(map)
    }

    static new<K, T> (map: [key: K, val: T][]): Map<K, T> {
        return new Map<K, T>(map)
    }

    popLeft (): [Map<K, T>, T | Und] {
        const [first, ...rest] = this._map
        return [Map.new(rest), first[1]]
    }

    popRight (): [Map<K, T>, T | Und] {
        const [...all] = this._map
        return [Map.new(all.slice(1)), all[all.length - 1] as T | Und]
    }

    pop (): [Map<K, T>, T | Und] {
        return this.popRight()
    }

    left (): T | Und {
        return this._map[Symbol.iterator]().next().value
    }

    right (): T | Und {
        const [...all] = this._map
        return all[all.length - 1][1]
    }

    every (fn: (item: T, key: K) => bool): bool {
        return [...this._map.entries()].every(([key, val]) => fn(val, key))
    }

    set (key: K, val: T): Map<K, T> {
        const newMap = Map.new([...this._map])
        newMap.set(key, val)
        return newMap
    }
}
