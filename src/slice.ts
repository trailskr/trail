import { no, ok, Opt, or } from "./opt"
import { Rng } from "./rng"
import { Vec } from "./vec"

const orLeft = <T>(val: Opt<T>): T => or(val, 0 as unknown as T)
const orRight = <T>(val: Opt<T>): T => or(val, Number.MAX_SAFE_INTEGER as unknown as T)

export class Slice<T extends number = usize> implements Rng<usize, T> {
    private readonly _left: Opt<T>
    private readonly _right: Opt<T>

    private constructor(left: Opt<T>, right: Opt<T>) {
        this._left = left
        this._right = right
    }

    static new<T extends number = usize>(left: Opt<T>, right: Opt<T>): Slice<T> {
        return new Slice(left, right)
    }

    left (): Opt<T> {
        return this._left
    }

    right (): Opt<T> {
        return this._right
    }

    orLeft (): T {
        return orLeft(this._left)
    }

    orRight (): T {
        return orRight(this._right)
    }

    len (): T {
        return this.orRight() - this.orLeft() as unknown as T
    }

    has (item: T): bool {
        return item < this.orRight() && item >= this.orLeft()
    }

    includes(item: Rng<usize, T>): bool {
        return orLeft(item.left()) >= this.orLeft() &&
            orLeft(item.left()) <= this.orRight() &&
            orRight(item.right()) <= this.orRight()
    }

    popLeft(): [Slice<T>, Opt<T>] {
        return this.len() === 0
            ? [this, no()]
            : [new Slice(ok(this.orLeft() + 1 as unknown as T), this.right()), this.left()]
    }

    popRight(): [Slice<T>, Opt<T>] {
        return this.len() === 0
            ? [this, no()]
            : [new Slice(this.left(), ok(this.orRight() - 1 as unknown as T)), this.right()]
    }

    skipLeft(amount: usize): Slice<T> {
        return amount >= this.len()
            ? new Slice(ok(this.orRight()), ok(this.orRight()))
            : new Slice(ok(this.orLeft() + amount as unknown as T), this.right())
    }

    skipRight(amount: usize): Slice<T> {
        return amount >= this.len()
            ? new Slice(ok(this.orLeft()), ok(this.orLeft()))
            : new Slice(this.left(), ok(this.orRight() - amount as unknown as T))
    }

    every(fn: (val: T, key: usize) => bool): bool {
        let index = 0
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            if (!fn(i, index)) return false
            index += 1
        }
        return true
    }

    some(fn: (val: T, key: usize) => bool): bool {
        let index = 0
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            if (fn(i, index)) return true
            index += 1
        }
        return false
    }

    fold<R>(initialValue: R, fn: (acc: R, item: T, key: usize, stop: () => void) => R): R {
        let acc = initialValue
        let stop = false
        let index = 0
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            acc = fn(acc, i, index, () => { stop = true })
            if (stop) break
            index += 1
        }
        return acc
    }

    reduce(fn: (a: T, b: T, key: usize) => T): T {
        let acc = this.orLeft()
        let index = 0
        for (let i = this.orLeft() + 1; i < this.orRight(); i++) {
            acc = fn(acc, i as unknown as T, index)
            index += 1
        }
        return acc
    }

    map<R>(fn: (val: T, key: usize) => R): Vec<R> {
        let index = 0
        const arr: R[] = []
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            arr.push(fn(i, index))
            index += 1
        }
        return Vec.from(arr)
    }

    filter(fn: (val: T, key: usize) => bool): Vec<T> {
        let index = 0
        const arr: T[] = []
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            if (fn(i, index)) arr.push(i)
            index += 1
        }
        return Vec.from(arr)
    }

    find(fn: (val: T, key: usize) => bool): Opt<T> {
        let index = 0
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            if (fn(i, index)) return ok(i)
            index += 1
        }
        return no()
    }

    findEntry(fn: (val: T, key: usize) => bool): Opt<[val: T, key: usize]> {
        let index = 0
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            if (fn(i, index)) return ok([i, index])
            index += 1
        }
        return no()
    }

    findKey(fn: (val: T, key: usize) => bool): Opt<usize> {
        let index = 0
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            if (fn(i, index)) return ok(index)
            index += 1
        }
        return no()
    }

    for(fn: (val: T, key: usize, stop: () => void) => void): void {
        let index = 0
        let stop = false
        for (let i = this.orLeft(); i < this.orRight(); i++) {
            fn(i, index, () => { stop = true })
            if (stop) break
            index += 1
        }
    }

    
}