export interface Rng<T, K = usize> {
    popLeft (): [Rng<T, K>, T | Und]
    popRight (): [Rng<T, K>, T | Und]
    pop (): [Rng<T, K>, T | Und]

    left (): T | Und
    right (): T | Und

    every (fn: (item: T, key: K) => bool): bool    
}
