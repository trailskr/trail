import { Map as ImmMap } from 'immutable'
import { Opt, optFrom } from './opt'

export class Map<K, T> {
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

    has (item: T): bool {
        return this._map.includes(item)
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
