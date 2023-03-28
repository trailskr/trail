import { Err } from './err'
import { isNo, isOk, no, ok, Opt } from './opt'
import { Slice } from './slice'
import { Str } from './str'
import { assertEq, unittest } from './unittest'
import { Vec } from './vec'

export interface InpLeftRng<K, T> {
    left(): Opt<T>
    popLeft(): [InpLeftRng<K, T>, Opt<T>]
    skipLeft(amount: usize): InpLeftRng<K, T>
    isEmpty(): bool
}

export interface InpRandomAccessInfiniteRng<K, T> extends InpLeftRng<K, T> {
    get(key: K): Opt<T>
}

export interface InpBidirRng<K, T> extends InpLeftRng<K, T> {
    right(): Opt<T>
    popRight(): [InpBidirRng<K, T>, Opt<T>]
    skipRight(amount: usize): InpBidirRng<K, T>
}

export interface InpRandomAccessFiniteRng<K, T> extends InpRandomAccessInfiniteRng<K, T> {
    len(): usize
    slice (fn: (len: usize) => Slice<usize>): InpRandomAccessFiniteRng<K, T>
}

export interface OutRightRng<K, T> {
    pushRight(val: T): OutRightRng<K, T>
}

export interface OutBidirRng<K, T> extends OutRightRng<K, T> {
    pushLeft(val: T): OutBidirRng<K, T>
}

export interface OutRandomAccessFiniteRng<K, T> extends OutBidirRng<K, T> {
    set(key: K, val: T): OutRandomAccessFiniteRng<K, T>
}

export type RandomAccessFiniteRng<K, T> = InpRandomAccessFiniteRng<K, T> & OutRandomAccessFiniteRng<K, T>

export const fold = <K, T, R>(rng: InpLeftRng<K, T>, initialValue: R, fn: (acc: R, item: T, stop: () => void) => R): R => {
    let stop = false
    const iterate = (res: R, rng: InpLeftRng<K, T>): R => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return res
        const ans = fn(res, left.val, () => { stop = true })
        if (stop) return ans
        return iterate(ans, newRange)
    }
    return iterate(initialValue, rng)
}

export const reduce = <K, T>(rng: InpLeftRng<K, T>, fn: (acc: T, item: T, stop: () => void) => T): Opt<T, Err> => {
    const [newRng, left] = rng.popLeft()
    if (isNo(left)) return no({ msg: Str.from('reduce on empty array') })
    let stop = false
    const iterate = (rng: InpLeftRng<K, T>, acc: T): T => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return acc
        const ans = fn(acc, left.val, () => { stop = true })
        if (stop) return ans
        return iterate(newRange, ans)
    }
    return ok(iterate(newRng, left.val))
}

export const forEach = <K, T>(rng: InpLeftRng<K, T>, fn: (item: T, stop: () => void) => void): void => {
    let stop = false
    const iterate = (rng: InpLeftRng<K, T>): void => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return
        fn(left.val, () => { stop = true })
        if (stop) return
        return iterate(newRange)
    }
    return iterate(rng)
}

export const find = <K, T>(rng: InpLeftRng<K, T>, fn: (val: T) => bool): Opt<T> => {
    const iterate = (rng: InpLeftRng<K, T>): Opt<T> => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return no()
        if (fn(left.val)) return left
        return iterate(newRange)
    }
    return iterate(rng)
}

export const every = <K, T>(rng: InpLeftRng<K, T>, fn: (val: T) => bool): bool => {
    return fold(rng, true, (_, item, stop) => {
        if (!fn(item)) {
            stop()
            return false
        }
        return true
    })
}

export const some = <K, T>(rng: InpLeftRng<K, T>, fn: (val: T) => bool): bool => {
    return fold(rng, false, (_, item, stop) => {
        if (fn(item)) {
            stop()
            return true
        }
        return false
    })
}

export const map = <R, K, T, V extends OutRightRng<K, R>>(rng: InpLeftRng<K, T>, fn: (val: T) => R, initialVec: V): V => {
    const iterate = (rng: InpLeftRng<K, T>, vec: V): V => {
        const [newRng, left] = rng.popLeft()
        if (isNo(left)) return vec
        const newVec = vec.pushRight(fn(left.val)) as V
        return iterate(newRng, newVec)
    }
    return iterate(rng, initialVec)
}

export const filter = <K, T, V extends OutRightRng<K, T>>(rng: InpLeftRng<K, T>, fn: (val: T) => bool, initialVec: V): V => {
    const iterate = (rng: InpLeftRng<K, T>, vec: V): V => {
        const [newRng, left] = rng.popLeft()
        if (isNo(left)) return vec
        const newVec = fn(left.val)
            ? vec.pushRight(left.val) as V
            : vec
        return iterate(newRng, newVec)
    }
    return iterate(rng, initialVec)
}

export const has = <K, T>(rng: InpLeftRng<K, T>, item: T): bool => {
    return isOk(find(rng, (a) => a === item))
}

export const concat = <K, T, V extends OutRightRng<K, T>>(appendTo: V, appendFrom: InpLeftRng<K, T>): V => {
    const iterate = (appendTo: V, appendFrom: InpLeftRng<K, T>): V => {
        const [newFrom, left] = appendFrom.popLeft()
        if (isNo(left)) return appendTo
        const newTo = appendTo.pushRight(left.val) as V
        return iterate(newTo, newFrom)
    }
    return iterate(appendTo, appendFrom)
}

class Enumeration<K, T> {
    private constructor (
        private readonly _rng: InpLeftRng<K, T>,
        private readonly _index: usize
    ) {}

    static new<K, T>(rng: InpLeftRng<K, T>, index: usize) {
        return new Enumeration(rng, index)
    }

    left(): Opt<[T, usize]> {
        const left = this._rng.left()
        return isOk(left)
            ? ok([left.val, this._index])
            : no()
    }

    popLeft(): [InpLeftRng<K, [T, usize]>, Opt<[T, usize]>] {
        const [newRng, left] = this._rng.popLeft()
        return isOk(left)
            ? [
                new Enumeration(newRng, this._index + 1),
                ok([left.val, this._index])
            ]
            : [
                new Enumeration(newRng, this._index + 1),
                no()
            ]
    }

    skipLeft(amount: usize): InpLeftRng<K, [T, usize]> {
        return new Enumeration(this._rng.skipLeft(amount), this._index + amount)
    }

    isEmpty(): bool {
        return this._rng.isEmpty()
    }
}

export const enumerate = <K, T>(rng: InpLeftRng<K, T>, from: usize = 0): InpLeftRng<K, [T, usize]> => {
    return Enumeration.new(rng, from)
}

export const includes = <K, T>(rngA: InpLeftRng<K, T>, rngB: InpLeftRng<K, T>): bool => {
    const equal = (rngA: InpLeftRng<K, T>, rngB: InpLeftRng<K, T>): bool => {
        const [newRngB, leftB] = rngB.popLeft()
        if (isNo(leftB)) return true
        const [newRngA, leftA] = rngA.popLeft()
        if (leftA.val !== leftB.val) return false
        return equal(newRngA, newRngB)
    }

    const iterate = (rngA: InpLeftRng<K, T>): bool => {
        if (equal(rngA, rngB)) return true
        if (rngA.isEmpty()) return false
        return iterate(rngA.skipLeft(1))
    }
    return iterate(rngA)
}

const test = () => {
    const vec = Vec.from([1, 2, 3])
    console.log(fold(vec, 0, (acc, item) => acc + item) === 6)
    console.log(includes(vec, Vec.from([2, 3])))
    console.log(isOk(find(vec, (item) => item === 1)))
    console.log(isNo(find(vec, (item) => item === 4)))
    const [enumer1, left1] = enumerate(vec).popLeft()
    console.log(isOk(left1) && left1.val[0] === 1 && left1.val[1] === 0)
    const [_, left2] = enumer1.popLeft()
    console.log(isOk(left2) && left2.val[0] === 2 && left2.val[1] === 1)
    
    console.log(some(vec, (item) => item === 2))
    console.log(!some(vec, (item) => item === 5))
    console.log(every(vec, (item) => item < 4))
    console.log(!every(vec, (item) => item === 1))

    const str = Str.from('123')
    console.log(includes(str, Str.from('23')))
    console.log(isOk(find(str, (item) => item === '1')))
    console.log(isNo(find(str, (item) => item === '4')))

    const str2 = Str.from('fn() // __TEST_CALL__')
    console.log(includes(str2, Str.from('__TEST_CALL__')))
}
