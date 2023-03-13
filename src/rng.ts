import { Opt } from "./opt"

export interface SetRng<K, T> {
    left(): Opt<T>
    right(): Opt<T>
    popLeft(): [SetRng<K, T>, Opt<T>]
    popRight(): [SetRng<K, T>, Opt<T>]
    skipLeft(amount: usize): SetRng<K, T>
    skipRight(amount: usize): SetRng<K, T>
    len(): usize
    has(item: T): bool
    includes(rng: SetRng<K, T>): bool
    every(fn: (val: T) => bool): bool
    some(fn: (val: T) => bool): bool
    fold<R>(initialValue: R, fn: (acc: R, item: T) => R): R
    reduce(fn: (a: T, b: T) => T): T
    map<R>(fn: (val: T) => R): SetRng<K, R>
    filter(fn: (val: T) => bool): SetRng<K, T>
    find(fn: (val: T) => bool): Opt<T>
    each(fn: (val: T) => void): void
}

export interface Rng<K, T> extends SetRng<K, T> {    
    get(key: K): Opt<T>
    set(key: K, val: T): Rng<K, T>

    every(fn: (val: T, key: K) => bool): bool
    some(fn: (val: T, key: K) => bool): bool
    fold<R>(initialValue: R, fn: (acc: R, item: T, key: K) => R): R
    reduce(fn: (a: T, b: T, key: K) => T): T
    map<R>(fn: (val: T, key: K) => R): Rng<K, R>
    filter(fn: (val: T, key: K) => bool): Rng<K, T>
    find(fn: (val: T, key: K) => bool): Opt<T>
    findEntry(fn: (val: T, key: K) => bool): Opt<[val: T, key: K]>
    findKey(fn: (val: T, key: K) => bool): Opt<K>
    each(fn: (val: T, key: K) => void): void
}
