import { Opt } from "./opt"

export interface Rng<K, T> {
    left(): Opt<T>
    right(): Opt<T>
    popLeft(): [Rng<K, T>, Opt<T>]
    popRight(): [Rng<K, T>, Opt<T>]
    pop(): [Rng<K, T>, Opt<T>]
    at(key: K): Opt<T>
    len(): usize

    every(fn: (val: T, key: K) => bool): bool
    some(fn: (val: T, key: K) => bool): bool
    fold<R>(initial_value: R, fn: (val: R, acc: R, item: T) => R): R
    reduce(fn: (a: T, b: T) => T): T
    map<R>(fn: (val: T, key: K) => R): Rng<K, R>
    filter(fn: (val: T, key: K) => bool): Rng<K, T>
    find(fn: (val: T, key: K) => bool): Opt<[val: T, key: K]>
    includes(item: T): bool
    each(fn: (val: T, key: K) => void): void
}
