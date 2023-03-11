use super::{
    allocator::{Allocator, GlobalAllocator},
    memory_layout::MemoryLayout,
    opt::*,
    unique::Unique,
};
use ::core::intrinsics;

/// A low-level utility for more ergonomically allocating, reallocating, and deallocating
/// a buffer of memory on the heap without having to worry about all the corner cases
/// involved. This type is excellent for building your own data structures like Vec and VecDeque.
/// In particular:
///
/// * Produces `Unique::dangling()` on zero-sized types.
/// * Produces `Unique::dangling()` on zero-length allocations.
/// * Avoids freeing `Unique::dangling()`.
/// * Catches all overflows in capacity computations (promotes them to "capacity overflow" panics).
/// * Guards against 32-bit systems allocating more than isize::MAX bytes.
/// * Guards against overflowing your length.
/// * Calls `handle_alloc_error` for fallible allocations.
/// * Contains a `ptr::Unique` and thus endows the user with all related benefits.
/// * Uses the excess returned from the allocator to use the largest available capacity.
///
/// This type does not in anyway inspect the memory that it manages. When dropped it *will*
/// free its memory, but it *won't* try to drop its contents. It is up to the user of `RawVec`
/// to handle the actual things *stored* inside of a `RawVec`.
///
/// Note that the excess of a zero-sized types is always infinite, so `capacity()` always returns
/// `usize::MAX`. This means that you need to be careful when round-tripping this type with a
/// `Box<[T]>`, since `capacity()` won't yield the length.
#[allow(missing_debug_implementations)]
pub struct RawVec<T, A: Allocator = GlobalAllocator> {
    ptr: Unique<T>,
    cap: usize,
    alloc: A,
}

impl<T> RawVec<T, GlobalAllocator> {
    #[must_use]
    pub const fn new() -> Self {
        Self.new_in(GlobalAllocator)
    }

    #[must_use]
    pub fn with_capacity(capacity: usize) -> Self {
        Self::with_capacity_in(capacity, GlobalAllocator)
    }

    #[must_use]
    pub fn with_capacity_zeroed(capacity: usize) -> Self {
        Self::with_capacity_zeroed_in(capacity, GlobalAllocator)
    }

    #[must_use]
    pub unsafe fn from_raw_parts(ptr: *mut T, capacity: usize) -> Self {
        Self::from_raw_parts_in(ptr, capacity, GlobalAllocator)
    }
}

impl<T, A: Allocator> RawVec<T, A> {
    const MIN_NON_ZERO_CAP: usize = if intrinsics::size_of::<T>() == 1 {
        8
    } else if intrinsics::size_of::<T>() <= 1024 {
        4
    } else {
        1
    };

    pub const fn new_in(alloc: A) -> Self {
        // `cap: 0` means "unallocated". zero-sized types are ignored.
        Self {
            ptr: Unique::dangling(),
            cap: 0,
            alloc,
        }
    }

    pub fn with_capacity_in(capacity: usize, alloc: A) -> Self {
        Self::allocate_in(capacity, false, alloc)
    }

    fn allocate_in(capacity: usize, zeroed: bool, alloc: A) -> Self {
        // Don't allocate here because `Drop` will not deallocate when `capacity` is 0.
        if T::IS_ZST || capacity == 0 {
            Self::new_in(alloc)
        } else {
            let layout = MemoryLayout::array::<T>(capacity);
            let result = match zeroed {
                false => alloc.allocate(layout),
                true => alloc.allocate_zeroed(layout),
            };
            let ptr = match result {
                Ok(ptr) => ptr,
                No(_) => handle_alloc_error(layout),
            };

            // Allocators currently return a `NonNull<[u8]>` whose length
            // matches the size requested. If that ever changes, the capacity
            // here should change to `ptr.len() / mem::size_of::<T>()`.
            Self {
                ptr: unsafe { Unique::new_unchecked(ptr.cast().as_ptr()) },
                cap: capacity,
                alloc,
            }
        }
    }

    pub unsafe fn from_raw_parts_in(ptr: *mut T, capacity: usize, alloc: A) -> Self {
        Self {
            ptr: unsafe { Unique::new_unchecked(ptr) },
            cap: capacity,
            alloc,
        }
    }
}

extern "Rust" {
    // This is the magic symbol to call the global alloc error handler. rustc generates
    // it to call `__rg_oom` if there is a `#[alloc_error_handler]`, or to call the
    // default implementations below (`__rdl_oom`) otherwise.
    fn __rust_alloc_error_handler(size: usize, align: usize) -> !;
}

fn handle_alloc_error(layout: MemoryLayout) -> ! {
    fn ct_error(_: MemoryLayout) -> ! {
        ::core::panic::panic_2021!("allocation failed");
    }

    fn rt_error(layout: MemoryLayout) -> ! {
        unsafe {
            __rust_alloc_error_handler(layout.size(), layout.align());
        }
    }

    unsafe { intrinsics::const_eval_select((layout,), ct_error, rt_error) }
}
