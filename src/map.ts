use super::rng::Rng

pub struct Map<K, T> {
    key: K,
    val: T,
}

impl<K, T> Map<K, T> {
    pub new(key: K, val: T): Self {
        Self { key, val }
    }
}

impl<K, T> Rng for Map<K, T> {
    // private readonly _map: globalThis.Map<K, T>

    // constructor (map: [key: K, val: T][]) {
    //     this._map = new globalThis.Map<K, T>(map)
    // }

    // static new<K, T> (map: [key: K, val: T][]): Map<K, T> {
    //     return new Map<K, T>(map)
    // }

    // popLeft (): [Map<K, T>, T | Und] {
    //     const [first, ...rest] = this._map
    //     return [Map.new(rest), first[1]]
    // }

    // popRight (): [Map<K, T>, T | Und] {
    //     const [...all] = this._map
    //     return [Map.new(all.slice(1)), all[all.length - 1] as T | Und]
    // }

    // pop (): [Map<K, T>, T | Und] {
    //     return this.popRight()
    // }

    // left (): T | Und {
    //     return this._map[Symbol.iterator]().next().value
    // }

    // right (): T | Und {
    //     const [...all] = this._map
    //     return all[all.length - 1][1]
    // }

    // at (key: K): T | Und {
    //     return this._map.get(key)
    // }

    // len (): usize {
    //     return this._map.size
    // }

    // every (fn: (item: T, key: K) => bool): bool {
    //     return [...this._map.entries()].every(([key, val]) => fn(val, key))
    // }

    // some (fn: (item: T, key: K) => bool): bool {
    //     return [...this._map.entries()].some(([key, val]) => fn(val, key))
    // }

    // fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R {
    //     return [...this._map.values()].reduce<R>(fn, initialValue)
    // }

    // reduce (fn: (a: T, b: T, index: usize) => T): T {
    //     return [...this._map.values()].reduce(fn)
    // }

    // map<R> (fn: (a: T, key: K) => R): Map<K, R> {
    //     const entries = [...this._map.entries()].map(([key, val]) => {
    //         return [key, fn(val, key)] as [K, R]
    //     })
    //     return Map.new(entries)
    // }

    // filter (fn: (a: T, key: K) => bool): Map<K, T> {
    //     return Map.new([...this._map.entries()].filter(([key, val]) => fn(val, key)))
    // }

    // find (fn: (a: T, key: K) => bool): [value: T, key: K] | Und {
    //     const entry = [...this._map.entries()].find(([key, val]) => fn(val, key))
    //     return entry === und ? und : [entry[1], entry[0]]
    // }

    // includes (item: T): bool {
    //     return this.find((a) => a === item) != und
    // }

    // each<R> (fn: (a: T, key: K) => R): Und {
    //     return this._map.forEach(fn)
    // }

    // slice (start: usize | Und, end: usize | Und): Map<K, T> {
    //     return Map.new([...this._map.entries()].slice(start!, end!))
    // }

    // set (key: K, val: T): Map<K, T> {
    //     const newMap = Map.new([...this._map])
    //     newMap.set(key, val)
    //     return newMap
    // }

    // _ (): globalThis.Map<K, T> {
    //     return this._map
    // }

    // valueOf (): globalThis.Map<K, T> {
    //     return this._()
    // }

    // toString (): globalThis.Map<K, T> {
    //     return this._()
    // }
}
