use ::core::intrinsics;

pub struct MemoryAlignment(MemoryAlignmentEnum);

impl MemoryAlignment {
    pub unsafe fn new_unchecked(align: usize) -> Self {
        // SAFETY: By precondition, this must be a power of two, and
        // our variants encompass all possible powers of two.
        unsafe { intrinsics::transmute::<usize, MemoryAlignment>(align) }
    }

    pub fn of<T>() -> Self {
        unsafe { MemoryAlignment::new_unchecked(intrinsics::min_align_of::<T>()) }
    }
}

#[cfg(target_pointer_width = "16")]
pub type MemoryAlignmentEnum = MemoryAlignmentEnum16;
#[cfg(target_pointer_width = "32")]
pub type MemoryAlignmentEnum = MemoryAlignmentEnum32;
#[cfg(target_pointer_width = "64")]
pub type MemoryAlignmentEnum = MemoryAlignmentEnum64;

#[derive(Copy, Clone, Eq, PartialEq)]
#[repr(u16)]
enum MemoryAlignmentEnum16 {
    Allign0 = 1 << 0,
    Allign1 = 1 << 1,
    Allign2 = 1 << 2,
    Allign3 = 1 << 3,
    Allign4 = 1 << 4,
    Allign5 = 1 << 5,
    Allign6 = 1 << 6,
    Allign7 = 1 << 7,
    Allign8 = 1 << 8,
    Allign9 = 1 << 9,
    Allign10 = 1 << 10,
    Allign11 = 1 << 11,
    Allign12 = 1 << 12,
    Allign13 = 1 << 13,
    Allign14 = 1 << 14,
    Allign15 = 1 << 15,
}

#[derive(Copy, Clone, Eq, PartialEq)]
#[repr(u32)]
enum MemoryAlignmentEnum32 {
    Allign0 = 1 << 0,
    Allign1 = 1 << 1,
    Allign2 = 1 << 2,
    Allign3 = 1 << 3,
    Allign4 = 1 << 4,
    Allign5 = 1 << 5,
    Allign6 = 1 << 6,
    Allign7 = 1 << 7,
    Allign8 = 1 << 8,
    Allign9 = 1 << 9,
    Allign10 = 1 << 10,
    Allign11 = 1 << 11,
    Allign12 = 1 << 12,
    Allign13 = 1 << 13,
    Allign14 = 1 << 14,
    Allign15 = 1 << 15,
    Allign16 = 1 << 16,
    Allign17 = 1 << 17,
    Allign18 = 1 << 18,
    Allign19 = 1 << 19,
    Allign20 = 1 << 20,
    Allign21 = 1 << 21,
    Allign22 = 1 << 22,
    Allign23 = 1 << 23,
    Allign24 = 1 << 24,
    Allign25 = 1 << 25,
    Allign26 = 1 << 26,
    Allign27 = 1 << 27,
    Allign28 = 1 << 28,
    Allign29 = 1 << 29,
    Allign30 = 1 << 30,
    Allign31 = 1 << 31,
}

#[derive(Copy, Clone, Eq, PartialEq)]
#[repr(u64)]
enum MemoryAlignmentEnum64 {
    Allign0 = 1 << 0,
    Allign1 = 1 << 1,
    Allign2 = 1 << 2,
    Allign3 = 1 << 3,
    Allign4 = 1 << 4,
    Allign5 = 1 << 5,
    Allign6 = 1 << 6,
    Allign7 = 1 << 7,
    Allign8 = 1 << 8,
    Allign9 = 1 << 9,
    Allign10 = 1 << 10,
    Allign11 = 1 << 11,
    Allign12 = 1 << 12,
    Allign13 = 1 << 13,
    Allign14 = 1 << 14,
    Allign15 = 1 << 15,
    Allign16 = 1 << 16,
    Allign17 = 1 << 17,
    Allign18 = 1 << 18,
    Allign19 = 1 << 19,
    Allign20 = 1 << 20,
    Allign21 = 1 << 21,
    Allign22 = 1 << 22,
    Allign23 = 1 << 23,
    Allign24 = 1 << 24,
    Allign25 = 1 << 25,
    Allign26 = 1 << 26,
    Allign27 = 1 << 27,
    Allign28 = 1 << 28,
    Allign29 = 1 << 29,
    Allign30 = 1 << 30,
    Allign31 = 1 << 31,
    Allign32 = 1 << 32,
    Allign33 = 1 << 33,
    Allign34 = 1 << 34,
    Allign35 = 1 << 35,
    Allign36 = 1 << 36,
    Allign37 = 1 << 37,
    Allign38 = 1 << 38,
    Allign39 = 1 << 39,
    Allign40 = 1 << 40,
    Allign41 = 1 << 41,
    Allign42 = 1 << 42,
    Allign43 = 1 << 43,
    Allign44 = 1 << 44,
    Allign45 = 1 << 45,
    Allign46 = 1 << 46,
    Allign47 = 1 << 47,
    Allign48 = 1 << 48,
    Allign49 = 1 << 49,
    Allign50 = 1 << 50,
    Allign51 = 1 << 51,
    Allign52 = 1 << 52,
    Allign53 = 1 << 53,
    Allign54 = 1 << 54,
    Allign55 = 1 << 55,
    Allign56 = 1 << 56,
    Allign57 = 1 << 57,
    Allign58 = 1 << 58,
    Allign59 = 1 << 59,
    Allign60 = 1 << 60,
    Allign61 = 1 << 61,
    Allign62 = 1 << 62,
    Allign63 = 1 << 63,
}
