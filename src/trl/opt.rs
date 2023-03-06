#[derive(Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Debug, Hash)]
pub enum Opt<T> {
    None,
    Some(T),
}

pub use Opt::None;
pub use Opt::Some;

impl<T> Opt<T> {}
