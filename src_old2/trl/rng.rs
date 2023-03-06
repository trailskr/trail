use super::opt::Opt;
use ::core::marker::Sized;
use ::core::ops::{Fn, Index};

pub trait Rng<K>: Index<K> {
    type T: Sized;

    fn left() -> Opt<Self::T>;
    fn right() -> Opt<Self::T>;
    fn popLeft() -> (Self, Opt<Self::T>);
    fn popRight() -> (Self, Opt<Self::T>);
    fn pop() -> (Self, Opt<Self::T>);
    fn at(key: K) -> Opt<Self::T>;

    fn len() -> usize;

    fn every<F>(f: F) -> bool
    where
        Self: Sized,
        F: Fn(Self::T, K) -> bool;

    fn some<F>(f: F) -> bool
    where
        Self: Sized,
        F: Fn(Self::T, K) -> bool;

    fn fold<F, R>(initialValue: R, f: F) -> R
    where
        Self: Sized,
        F: Fn(R, Self::T, usize) -> R;

    fn reduce<F>(f: F) -> Self::T
    where
        Self: Sized,
        F: Fn(Self::T, Self::T, usize) -> Self::T;

    fn map<F, R>(f: F) -> dyn Rng<K, T = R, Output = K>
    where
        Self: Sized,
        F: Fn(Self::T, K) -> R;

    fn filter<F>(f: F) -> Self<K, T>
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn find<F>(f: F) -> Opt<(T, K)>
    where
        Self: Sized,
        F: Fn(T, K) -> bool;

    fn includes(item: T) -> bool;

    fn each<F>(f: F) -> Und
    where
        Self: Sized,
        F: Fn(T, K) -> Und;
}
