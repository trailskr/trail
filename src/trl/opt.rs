#[derive(Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Debug, Hash)]
pub enum Opt<T> {
    None,
    Some(T),
}

impl<T> Opt<T> {}
