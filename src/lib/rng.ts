export interface Rng<K, T> {
    popLeft (): [Rng<K, T>, T | Und]
    popRight (): [Rng<K, T>, T | Und]
    pop (): [Rng<K, T>, T | Und]

    left (): T | Und
    right (): T | Und

    all (fn: (item: T, key: K) => bool): bool
    fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R
    reduce (fn: (a: T, b: T, index: usize) => T): T
}
