use super::str::Str;

pub trait Err {
    fn msg() -> Str;
}
