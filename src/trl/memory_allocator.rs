pub trait MemoryAllocator {
    fn alloc(size: usize, align: usize) -> *mut u8;
    fn dealloc(ptr: *mut u8, size: usize, align: usize);
    fn realloc(ptr: *mut u8, old_size: usize, align: usize, new_size: usize) -> *mut u8;
    fn allocZeroed(size: usize, align: usize) -> *mut u8;
}
