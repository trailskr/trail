use super::momory_allignment::MemoryAlignment;
use ::core::intrinsics;

pub struct MemoryLayout {
    size: usize,
    align: MemoryAlignment,
}

fn size_align<T>() -> (usize, usize) {
    (intrinsics::size_of::<T>(), intrinsics::min_align_of::<T>())
}

impl MemoryLayout {
    pub fn new<T>() -> Self {
        let (size, align) = size_align::<T>();
        // SAFETY: if the type is instantiated, rustc already ensures that its
        // layout is valid. Use the unchecked constructor to avoid inserting a
        // panicking codepath that needs to be optimized out.
        unsafe { MemoryLayout::from_size_align_unchecked(size, align) }
    }

    pub fn size(self) {
        self.size
    }

    pub fn align(self) {
        self.size
    }
}
