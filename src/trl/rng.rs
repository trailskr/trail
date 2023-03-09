use super::opt::Opt;
use ::core::marker::Sized;
use ::core::ops::Fn;

pub trait Rng {
    type Key;
    type Item;

    fn left() -> Opt<Self::Item>;
    fn right() -> Opt<Self::Item>;
    fn popLeft() -> (Self, Opt<Self::Item>)
    where
        Self: Sized;
    fn popRight() -> (Self, Opt<Self::Item>)
    where
        Self: Sized;
    fn pop() -> (Self, Opt<Self::Item>)
    where
        Self: Sized;
    fn at(key: Self::Key) -> Opt<Self::Item>;

    fn len() -> usize;

    fn every<F>(f: F) -> bool
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn some<F>(f: F) -> bool
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn fold<F, R>(initial_value: R, f: F) -> R
    where
        Self: Sized,
        F: Fn(R, Self::Item, usize) -> R;

    fn reduce<F>(f: F) -> Self::Item
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Item, usize) -> Self::Item;

    fn map<F, R>(f: F) -> dyn Rng<Key = Self::Key, Item = R>
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> R;

    fn filter<F>(f: F) -> Self
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn find<F>(f: F) -> Opt<(Self::Item, Self::Key)>
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn includes(item: Self::Item) -> bool;

    fn each<F>(f: F)
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key);
}
