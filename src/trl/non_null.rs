use super::opt::*;
use ::core::intrinsics;
use ::core::marker::{Send, Sized, Sync};

pub struct NonNull<T: ?Sized> {
    ptr: *const T,
}

/// `NonNull` pointers are not `Send` because the data they reference may be aliased.
// N.B., this impl is unnecessary, but should provide better error messages.
impl<T: ?Sized> !Send for NonNull<T> {}

/// `NonNull` pointers are not `Sync` because the data they reference may be aliased.
// N.B., this impl is unnecessary, but should provide better error messages.
impl<T: ?Sized> !Sync for NonNull<T> {}

impl<T> NonNull<T> {
    pub fn new(ptr: *mut T) -> Opt<Self> {
        if ptr.is_null() {
            Ok(NonNull { ptr })
        } else {
            No
        }
    }

    pub unsafe fn new_unchecked(ptr: *mut T) -> Self {
        // SAFETY: the caller must guarantee that `ptr` is non-null.
        unsafe {
            assert!(
                !ptr.is_null(),
                "NonNull::new_unchecked requires that the pointer is non-null",
            );
            NonNull { ptr }
        }
    }

    pub fn dangling() -> Self {
        // SAFETY: mem::align_of() returns a non-zero usize which is then casted
        // to a *mut T. Therefore, `ptr` is not null and the conditions for
        // calling new_unchecked() are respected.
        unsafe {
            let ptr = intrinsics::transmute::<T>(intrinsics::min_align_of::<T>());
            NonNull::new_unchecked(ptr)
        }
    }
}
