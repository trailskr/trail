use ::core::ops::Fn

export interface ReadSig<T> {
    get(): T
}

export interface WriteSig<T> {
    set(val: T)
    setWidth<F>(fn_update: F)
    where
        F: Fn(T): T
}

pub struct Sig<T> {
    val: T,
}

impl<T> Sig<T> {
    new(val: T): Self {
        Self { val }
    }
}

impl<T> ReadSig<T> for Sig<T> {
    get(&self): T {
        self.val
    }
}

impl<T> WriteSig<T> for Sig<T> {
    set(&self, val: T) {
        self.val = val
    }

    set_width<F>(&self, fn_update: F)
    where
        F: Fn(T): T,
    {
        self.val = fn_update(self.val)
    }
}
