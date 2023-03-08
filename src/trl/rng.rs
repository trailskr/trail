use super::opt::Opt;
use ::core::marker::Sized;
use ::core::ops::{Fn, Index};

pub trait Rng<K, T>: Index<K> {
    fn left() -> Opt<T>;
    fn right() -> Opt<T>;
    fn popLeft() -> (Self, Opt<T>);
    fn popRight() -> (Self, Opt<T>);
    fn pop() -> (Self, Opt<T>);
    fn at(key: K) -> Opt<T>;

    fn len() -> usize;

    fn every<F>(f: F) -> bool
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn some<F>(f: F) -> bool
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn fold<F, R>(initial_value: R, f: F) -> R
    where
        Self: Sized,
        F: Fn(R, T, usize) -> R;

    fn reduce<F>(f: F) -> T
    where
        Self: Sized,
        F: Fn(T, T, usize) -> T;

    fn map<F, R>(f: F) -> dyn Rng<K, R, Output = K>
    where
        Self: Sized,
        F: Fn(T, K) -> R;

    fn filter<F>(f: F) -> Self
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn find<F>(f: F) -> Opt<(T, K)>
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn includes(item: T) -> bool;

    fn each<F>(f: F)
    where
        Self: Sized,
        F: Fn(T, K);
}
