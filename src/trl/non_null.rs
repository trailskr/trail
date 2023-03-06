use super::opt::*;

pub struct NonNull<T: ?Sized> {
    ptr: *const T,
}

impl<T> NonNull<T> {
    pub fn new(ptr: *mut T) -> Opt<Self> {
        if ptr.is_null() {
            Some(NonNull { ptr })
        } else {
            None
        }
    }
}
