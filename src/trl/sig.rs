use ::core::ops::Fn;

pub trait ReadSig<T> {
    fn get() -> T;
}

pub trait WriteSig<T> {
    fn set(val: T);
    fn set_width<F>(fn_update: F)
    where
        F: Fn(T) -> T;
}

pub struct Sig<T> {
    val: T,
}

impl<T> Sig<T> {
    fn new(val: T) -> Self {
        Self { val }
    }
}

impl<T> ReadSig<T> for Sig<T> {
    fn get(&self) -> T {
        self.val
    }
}

impl<T> WriteSig<T> for Sig<T> {
    fn set(&self, val: T) {
        self.val = val
    }

    fn set_width<F>(&self, fn_update: F)
    where
        F: Fn(T) -> T,
    {
        self.val = fn_update(self.val)
    }
}
