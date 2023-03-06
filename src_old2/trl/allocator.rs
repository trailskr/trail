use super::err::Err;
use super::memory_allocator::GlobalMemoryAllocator;
use super::memory_layout::MemoryLayout;
use super::non_null::NonNull;
use super::res::*;

#[derive(Debug)]
pub struct AllocError;

impl Err for AllocError {}

pub trait Allocator {
    fn alloc(&self, layout: MemoryLayout, zeroed: bool) -> Res<NonNull<[u8]>, AllocError>;

    fn grow(
        &self,
        ptr: NonNull<u8>,
        old_layout: MemoryLayout,
        new_layout: MemoryLayout,
        zeroed: bool,
    ) -> Res<NonNull<[u8]>, AllocError>;
}

struct GlobalAllocator;

impl Allocator for GlobalAllocator {
    fn alloc(&self, layout: MemoryLayout, zeroed: bool) -> Res<NonNull<[u8]>, AllocError> {
        match layout.size() {
            0 => Ok(NonNull::slice_from_raw_parts(layout.dangling(), 0)),
            // SAFETY: `layout` is non-zero in size,
            size => unsafe {
                let raw_ptr = if zeroed {
                    GlobalMemoryAllocator::alloc_zeroed(layout)
                } else {
                    GlobalMemoryAllocator::alloc(layout)
                };
                let ptr = NonNull::new(raw_ptr).ok_or(AllocError)?;
                Ok(NonNull::slice_from_raw_parts(ptr, size))
            },
        }
    }
}
