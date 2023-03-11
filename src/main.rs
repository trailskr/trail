#![no_implicit_prelude]
#![feature(rustc_attrs)]
#![feature(core_intrinsics)]
#![feature(negative_impls)]
#![feature(edition_panic)]

mod trl;

use trl::vec::Vec;

fn main() {
    let arr = Vec::from([1, 2, 3]);
}
