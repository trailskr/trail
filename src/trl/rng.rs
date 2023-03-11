use super::opt::Opt;
use ::core::marker::Sized;
use ::core::ops::Fn;

pub trait Rng {
    type Key;
    type Item;

    fn left(&self) -> Opt<Self::Item>;
    fn right(&self) -> Opt<Self::Item>;
    fn popLeft(&mut self) -> (Self, Opt<Self::Item>)
    where
        Self: Sized;
    fn popRight(&mut self) -> (Self, Opt<Self::Item>)
    where
        Self: Sized;
    fn pop(&mut self) -> (Self, Opt<Self::Item>)
    where
        Self: Sized;
    fn at(&self, key: Self::Key) -> Opt<Self::Item>;

    fn len(&self) -> usize;

    fn every<F>(&self, f: F) -> bool
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn some<F>(&self, f: F) -> bool
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn fold<F, R>(&self, initial_value: R, f: F) -> R
    where
        Self: Sized,
        F: Fn(R, Self::Item, usize) -> R;

    fn reduce<F>(&self, f: F) -> Self::Item
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Item, usize) -> Self::Item;

    fn map<F, R>(&self, f: F) -> dyn Rng<Key = Self::Key, Item = R>
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> R;

    fn filter<F>(&self, f: F) -> Self
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn find<F>(&self, f: F) -> Opt<(Self::Item, Self::Key)>
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key) -> bool;

    fn includes(&self, item: Self::Item) -> bool;

    fn each<F>(&self, f: F)
    where
        Self: Sized,
        F: Fn(Self::Item, Self::Key);
}
