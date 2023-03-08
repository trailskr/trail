#[derive(Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Debug, Hash)]
pub enum Opt<T, E = ()> {
    Ok(T),
    No(E),
}

pub use Opt::{No, Ok};

impl<T, E> Opt<T, E> {
    pub fn is_ok(&self) -> bool {
        return *self == Ok;
    }

    pub fn ok_or(&self, val: T) -> T {
        match *self {
            Ok(ok_val) => ok_val,
            No(_) => val,
        }
    }
}
