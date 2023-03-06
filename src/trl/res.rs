#[derive(Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Debug, Hash)]
pub enum Res<T, E> {
    Ok(T),
    Err(E),
}

impl<T> Res<T> {}
