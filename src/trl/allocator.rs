use crate::err::Err;
use crate::non_null::NonNull;
use crate::res::Res;

#[derive(Debug, Display)]
pub struct AllocError;

impl Err for AllocError {}

pub trait Allocator {
    fn alloc(&self, layout: MemoryLayout, zeroed: bool) -> Res<NonNull<[u8]>, AllocError>;

    fn grow_impl(
        &self,
        ptr: NonNull<u8>,
        old_layout: Layout,
        new_layout: Layout,
        zeroed: bool,
    ) -> Res<NonNull<[u8]>, AllocError>;
}
