extern "Rust" {
    // These are the magic symbols to call the global allocator. rustc generates
    // them to call `__rg_alloc` etc. if there is a `#[global_allocator]` attribute
    // (the code expanding that attribute macro generates those functions), or to call
    // the default implementations in std (`__rdl_alloc` etc. in `library/std/src/alloc.rs`)
    // otherwise.
    // The rustc fork of LLVM 14 and earlier also special-cases these function names to be able to optimize them
    // like `malloc`, `realloc`, and `free`, respectively.
    #[rustc_allocator]
    #[rustc_nounwind]
    fn __rust_alloc(size: usize, align: usize) -> *mut u8;
    #[rustc_allocator_zeroed]
    #[rustc_nounwind]
    fn __rust_alloc_zeroed(size: usize, align: usize) -> *mut u8;
    #[rustc_deallocator]
    #[rustc_nounwind]
    fn __rust_dealloc(ptr: *mut u8, size: usize, align: usize);
    #[rustc_reallocator]
    #[rustc_nounwind]
    fn __rust_realloc(ptr: *mut u8, old_size: usize, align: usize, new_size: usize) -> *mut u8;
}

pub trait MemoryAllocator {
    fn alloc(size: usize, align: usize) -> *mut u8;
    fn dealloc(ptr: *mut u8, size: usize, align: usize);
    fn realloc(ptr: *mut u8, old_size: usize, align: usize, new_size: usize) -> *mut u8;
    fn allocZeroed(size: usize, align: usize) -> *mut u8;
}

pub struct GlobalMemoryAllocator;

impl MemoryAllocator for GlobalMemoryAllocator {
    fn alloc(size: usize, align: usize) -> *mut u8 {
        unsafe { __rust_alloc(size, align) }
    }

    fn allocZeroed(size: usize, align: usize) -> *mut u8 {
        unsafe { __rust_alloc_zeroed(size, align) }
    }

    fn dealloc(ptr: *mut u8, size: usize, align: usize) {
        unsafe { __rust_dealloc(ptr, size, align) }
    }

    fn realloc(ptr: *mut u8, old_size: usize, align: usize, new_size: usize) -> *mut u8 {
        unsafe { __rust_realloc(ptr, old_size, align, new_size) }
    }
}
