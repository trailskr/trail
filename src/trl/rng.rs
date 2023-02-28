use super::opt::Opt;

pub trait Rng<K, T>: std::ops::Index<K> {
    fn left() -> Opt<T>;
    fn right() -> Opt<T>;
    fn popLeft() -> (Rng<K, T>, Opt<T>);
    fn popRight() -> (Rng<K, T>, Opt<T>);
    fn pop() -> (Rng<K, T>, Opt<T>);
    fn at(key: K) -> Opt<T>;

    fn len() -> usize;

    fn every(f: F) -> bool
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn some(f: F) -> bool
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn fold<R>(initialValue: R, f: F) -> R
    where
        Self: Sized,
        F: Fn(R, T, usize) -> R;

    fn reduce(f: F) -> T
    where
        Self: Sized,
        F: Fn(T, T, usize) -> T;

    fn map<R>(f: F) -> Rng<K, R>
    where
        Self: Sized,
        F: Fn(T, K) -> R;

    fn filter(f: F) -> Rng<K, T>
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn find(f: F) -> Opt<(T, K)>
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn includes(item: T) -> bool;

    fn each(f: F) -> Und
    where
        Self: Sized,
        F: Fn(T, K) -> Und;
}
