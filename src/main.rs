#![warn(clippy::all, clippy::pedantic, clippy::nursery)]
#![no_implicit_prelude]

use ::std::println;
use ::trail::prelude::*;

fn main() {
    let val: Option<i32> = None;
    println!("Hello, world! {:?}", val);
}
