use crate::prelude::*;
use ::core::marker::Sized;

pub trait Range: Sized {
    type Item;

    fn pop_left(_: Self) -> (Self, Option<Self::Item>);
}
