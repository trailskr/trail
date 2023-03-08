use super::{momory_allignment::MemoryAlignment, opt::*};
use ::core::intrinsics;

pub struct MemoryLayout {
    size: usize,
    align: MemoryAlignment,
}

fn size_align<T>() -> (usize, usize) {
    (intrinsics::size_of::<T>(), intrinsics::min_align_of::<T>())
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct LayoutError;

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

    /// Creates a layout describing the record for a `[T; n]`.
    ///
    /// On arithmetic overflow or when the total size would exceed
    /// `isize::MAX`, returns `LayoutError`.
    pub const fn array<T>(n: usize) -> Opt<Self, LayoutError> {
        // Reduce the amount of code we need to monomorphize per `T`.
        return inner(intrinsics::size_of::<T>(), MemoryAlignment::of::<T>(), n);

        #[inline]
        const fn inner(
            element_size: usize,
            align: MemoryAlignment,
            n: usize,
        ) -> Opt<MemoryLayout, LayoutError> {
            // We need to check two things about the size:
            //  - That the total size won't overflow a `usize`, and
            //  - That the total size still fits in an `isize`.
            // By using division we can check them both with a single threshold.
            // That'd usually be a bad idea, but thankfully here the element size
            // and alignment are constants, so the compiler will fold all of it.
            if element_size != 0 && n > MemoryLayout::max_size_for_align(align) / element_size {
                return No(LayoutError);
            }

            let array_size = element_size * n;

            // SAFETY: We just checked above that the `array_size` will not
            // exceed `isize::MAX` even when rounded up to the alignment.
            // And `Alignment` guarantees it's a power of two.
            unsafe {
                Ok(MemoryLayout::from_size_align_unchecked(
                    array_size,
                    align.as_usize(),
                ))
            }
        }
    }
}
