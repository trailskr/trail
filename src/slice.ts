import { Opt } from "./opt"

export class Slice<T = usize> {
    private readonly _left: Opt<T>
    private readonly _right: Opt<T>

    private constructor(left: Opt<T>, right: Opt<T>) {
        this._left = left
        this._right = right
    }

    static new<T = usize>(left: Opt<T>, right: Opt<T>): Slice<T> {
        return new Slice(left, right)
    }

    left (): Opt<T> {
        return this._left
    }

    right (): Opt<T> {
        return this._right
    }
}