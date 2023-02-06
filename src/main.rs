#![no_implicit_prelude]

use ::std::println;
use ::trail::prelude::*;
use ::trail::std::arr::Arr;

fn main() {
    let val: Option<i32> = None;
    let v = Arr::<u32>::new();
    println!("Hello, world! {:?} {}", val, v.len());
}
