import { Opt } from "./opt"

export interface Rng<K, T> {
    left(): Opt<T>
    right(): Opt<T>
    popLeft(): [Rng<K, T>, Opt<T>]
    popRight(): [Rng<K, T>, Opt<T>]
    pop(): [Rng<K, T>, Opt<T>]
    at(key: K): Opt<T>
    len(): usize

    every<F>(f: (T, K) => bool): bool
    some<F>(f: (T, K) => bool): bool
    fold<F, R>(initial_value: R, f: (R, T, usize) => R): R
    reduce<F>(f: (T, T, usize) => T): T
    map<F, R>(f: (T, K) => R): dyn Rng<Key = K, Item = R>
    filter<F>(f: (T, K) => bool): Self
    find<F>(f: (T, K) => bool): Opt<(T, K)>
    includes(item: T): bool
    each<F>(f: (T, K) => void)
}
