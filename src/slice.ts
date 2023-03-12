export class Slice {
    private readonly _left: usize
    private readonly _right: usize

    private constructor(left: usize, right: usize) {
        this._left = left
        this._right = right
    }

    static new(len: usize, fn: (len: usize) => [left: usize, right: usize]): Slice {
        const [left, right] = fn(len)
        return new Slice(left, right)
    }

    left (): usize {
        return this._left
    }

    right (): usize {
        return this._right
    }
}