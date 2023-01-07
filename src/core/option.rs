//! Optional values.

/// The `Option` type. See [the module level documentation](self) for more.
#[derive(Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Debug, Hash)]
pub enum Option<T> {
    /// No value.
    None,
    /// Some value of type `T`.
    Some(T),
}

impl<T> Option<T> {}
