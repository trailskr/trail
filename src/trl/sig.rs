pub trait ReadSig<T> {
    fn get() -> T
}

pub trait WriteSig<T> {
    fn set(val: T) -> Und
    fn setWith<F>(fnUpdate: F) -> Und
    where F: Fn(val: T) -> T
}

pub struct Sig<T>: ReadSig<T> + WriteSig<T> {
    val: T
}

impl Sig {
    fn new<T> (val: T) -> Self {
        Sig<T> { val }
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

    fn setWith<F>(fnUpdate: F)
    where F: Fn(val: T) => T {
        this._val = fnUpdate(this.get())
    }
}
