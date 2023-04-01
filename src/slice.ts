import { no, ok, Opt, or } from './opt'
import { InpBidirRng } from './rng'

const orLeft = <T>(val: Opt<T>): T => or(val, 0 as unknown as T)
const orRight = <T>(val: Opt<T>): T => or(val, Number.MAX_SAFE_INTEGER as unknown as T)

export class Slice<T extends number = usize> implements InpBidirRng<T> {
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

    isEmpty(): boolean {
        return this.len() === 0
    }

    has (item: T): bool {
        return item < this.orRight() && item >= this.orLeft()
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

    withoutLeft(): Slice<T> {
        return this.skipLeft(1)
    }

    skipLeft(amount: usize): Slice<T> {
        return amount >= this.len()
            ? new Slice(ok(this.orRight()), ok(this.orRight()))
            : new Slice(ok(this.orLeft() + amount as unknown as T), this.right())
    }

    withoutRight(): Slice<T> {
        return this.skipRight(1)
    }

    skipRight(amount: usize): Slice<T> {
        return amount >= this.len()
            ? new Slice(ok(this.orLeft()), ok(this.orLeft()))
            : new Slice(this.left(), ok(this.orRight() - amount as unknown as T))
    }
}