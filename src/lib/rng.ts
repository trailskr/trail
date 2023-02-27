export interface Rng<K, T> {
    popLeft (): [Rng<K, T>, T | Und]
    popRight (): [Rng<K, T>, T | Und]
    pop (): [Rng<K, T>, T | Und]

    left (): T | Und
    right (): T | Und
    at (key: K): T | Und
    len(): usize

    every (fn: (item: T, key: K) => bool): bool
    some (fn: (item: T, key: K) => bool): bool
    fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R
    reduce (fn: (a: T, b: T, index: usize) => T): T
    map<R> (fn: (a: T, key: K) => R): Rng<K, R>
    filter (fn: (a: T, key: K) => bool): Rng<K, T>
    find (fn: (a: T, key: K) => bool): [value: T, key: K] | Und
    includes (item: T): bool
    for (fn: (a: T, key: K) => Und): Und
    slice(start: usize | Und, end: usize | Und): Rng<K, T>
}
