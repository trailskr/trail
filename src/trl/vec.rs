use super::opt::*;

pub struct Vec<T> {
    arr: std::vec::Vec<T>,
}

impl<usize, T> Rng<usize, T> for Vec<T> {
    fn new<T>(arr: [T]) -> Self {
        return Vec::from(arr);
    }

    fn len<T>(len: usize, default: T) -> Self {
        return vec![default; len];
    }

    fn left(&self) -> Opt<T> {
        return self.arr.get(0);
    }

    fn right(&self) -> Opt<T> {
        return self.arr.get(self.arr.len() - 1);
    }

    fn popLeft() -> (Vec<T>, Opt<T>) {
        let first = this.arr[0];
        return (Vec.new(rest), first);
    }
}

//     popRight (): [Vec<T>, T | Und] {
//         const last = this._arr[this._arr.length - 1]
//         return [Vec.new(this._arr.slice(1)), last as T | Und]
//     }

//     pop (): [Vec<T>, T | Und] {
//         return this.popRight()
//     }

//     at (key: usize): T | Und {
//         return this._arr[key]
//     }

//     len (): usize {
//         return this._arr.length
//     }

//     every (fn: (item: T, key: usize) => bool): bool {
//         return this._arr.every(fn)
//     }

//     some (fn: (item: T, key: usize) => bool): bool {
//         return this._arr.some(fn)
//     }

//     fold<R> (initialValue: R, fn: (acc: R, item: T, index: usize) => R): R {
//         return this._arr.reduce<R>(fn, initialValue)
//     }

//     reduce (fn: (a: T, b: T, index: usize) => T): T {
//         return this._arr.reduce(fn)
//     }

//     map<R> (fn: (a: T, key: usize) => R): Vec<R> {
//         return Vec.new(this._arr.map(fn))
//     }

//     filter (fn: (a: T, key: usize) => bool): Vec<T> {
//         return Vec.new(this._arr.filter(fn))
//     }

//     find (fn: (a: T, key: usize) => bool): [value: T, key: usize] | Und {
//         const key = this._arr.findIndex(fn)
//         return key === -1 ? und : [this._arr[key], key]
//     }

//     includes (item: T): bool {
//         return this.find((a) => a === item) != und
//     }

//     each<R> (fn: (a: T, key: usize) => R): Und {
//         return this._arr.forEach(fn)
//     }

//     slice (start: usize | Und, end: usize | Und): Vec<T> {
//         return Vec.new(this._arr.slice(start!, end!))
//     }

//     push (val: T): Vec<T> {
//         return Vec.new([...this._arr, val])
//     }

//     join (val: Str): Str {
//         return Str.new(this._arr.join(val._()))
//     }

//     concat (val: Vec<T>): Vec<T> {
//         return Vec.new([...this._arr, ...val._()])
//     }

//     _ (): T[] {
//         return this._arr
//     }

//     valueOf (): T[] {
//         return this._()
//     }

//     toString (): T[] {
//         return this._()
//     }
// }
