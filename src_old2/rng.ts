import { Err } from './err'
import { isNo, isOk, no, ok, Opt } from './opt'
import { Slice } from './slice'
import { Str } from './str'
import { Vec } from './vec'

export interface InpLeftRng<T> {
    left(): Opt<T>
    popLeft(): [InpLeftRng<T>, Opt<T>]
    withoutLeft(): InpLeftRng<T>
    skipLeft(amount: usize): InpLeftRng<T>
    isEmpty(): bool
}

export interface InpBidirRng<T> extends InpLeftRng<T> {
    right(): Opt<T>
    popRight(): [InpBidirRng<T>, Opt<T>]
    withoutRight(): InpBidirRng<T>
    skipRight(amount: usize): InpBidirRng<T>
}

export interface InpRandomAccessInfiniteRng<T> extends InpLeftRng<T> {
    getAt(key: usize): Opt<T>
}

export interface InpRandomAccessFiniteRng<T> extends InpRandomAccessInfiniteRng<T>, InpBidirRng<T> {
    len(): usize
    slice (fn: (len: usize) => Slice): InpRandomAccessFiniteRng<T>
}

export interface OutRightRng<T> {
    pushRight(val: T): OutRightRng<T>
}

export interface OutBidirRng<T> extends OutRightRng<T> {
    pushLeft(val: T): OutBidirRng<T>
}

export interface OutRandomAccessFiniteRng<T> extends OutBidirRng<T> {
    setAt(key: usize, val: T): OutRandomAccessFiniteRng<T>
}

export type RandomAccessFiniteRng<T> = InpRandomAccessFiniteRng<T> & OutRandomAccessFiniteRng<T>

export const fold = <T, R>(rng: InpLeftRng<T>, initialValue: R, fn: (acc: R, item: T) => R): R => {
    const iterate = (res: R, rng: InpLeftRng<T>): R => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return res
        const ans = fn(res, left.val)
        return iterate(ans, newRange)
    }
    return iterate(initialValue, rng)
}

export const reduce = <T>(rng: InpLeftRng<T>, fn: (acc: T, item: T) => T): Opt<T, Err> => {
    const [newRng, left] = rng.popLeft()
    if (isNo(left)) return no({ msg: Str.from('reduce on empty array') })
    const iterate = (rng: InpLeftRng<T>, acc: T): T => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return acc
        const ans = fn(acc, left.val)
        return iterate(newRange, ans)
    }
    return ok(iterate(newRng, left.val))
}

export const forEach = <T>(rng: InpLeftRng<T>, fn: (item: T) => void): void => {
    const iterate = (rng: InpLeftRng<T>): void => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return
        fn(left.val)
        return iterate(newRange)
    }
    return iterate(rng)
}

export const findItem = <T>(rng: InpLeftRng<T>, fn: (val: T) => bool): Opt<T> => {
    const iterate = (rng: InpLeftRng<T>): Opt<T> => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return no()
        if (fn(left.val)) return left
        return iterate(newRange)
    }
    return iterate(rng)
}

export const find = <T>(rng: InpLeftRng<T>, fn: (val: T) => bool): [InpLeftRng<T>, Opt<T>] => {
    const iterate = (rng: InpLeftRng<T>): [InpLeftRng<T>, Opt<T>] => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return [newRange, no()]
        if (fn(left.val)) return [newRange, left]
        return iterate(newRange)
    }
    return iterate(rng)
}

export const every = <T>(rng: InpLeftRng<T>, fn: (val: T) => bool): bool => {
    return isNo(findItem(rng, (item) => fn(item) === false))
}

export const some = <T>(rng: InpLeftRng<T>, fn: (val: T) => bool): bool => {
    return isOk(findItem(rng, (item) => fn(item) === true))
}

class Mapper<T, R> implements InpLeftRng<R> {
    private constructor (
        private readonly _rng: InpLeftRng<T>,
        private readonly _fn: (val: T) => R
    ) {}

    static new<T, R>(rng: InpLeftRng<T>, _fn: (val: T) => R) {
        return new Mapper<T, R>(rng, _fn)
    }

    left(): Opt<R> {
        const left = this._rng.left()
        return isOk(left)
            ? ok(this._fn(left.val))
            : no()
    }

    popLeft(): [InpLeftRng<R>, Opt<R>] {
        const [newRng, left] = this._rng.popLeft()
        return isOk(left)
            ? [
                new Mapper(newRng, this._fn),
                ok(this._fn(left.val))
            ]
            : [
                new Mapper(newRng, this._fn),
                no()
            ]
    }

    withoutLeft(): InpLeftRng<R> {
        return new Mapper(this._rng.withoutLeft(), this._fn)
    }

    skipLeft(amount: usize): InpLeftRng<R> {
        return new Mapper(this._rng.skipLeft(amount), this._fn)
    }

    isEmpty(): bool {
        return this._rng.isEmpty()
    }

    collect<V extends OutRightRng<R>>(initialVec: V): V {
        const iterate = (rng: InpLeftRng<R>, vec: V): V => {
            const [newRng, left] = rng.popLeft()
            if (isNo(left)) return vec
            const newVec = vec.pushRight(left.val) as V
            return iterate(newRng, newVec)
        }
        return iterate(this, initialVec)
    }
}

export const map = <T, R>(rng: InpLeftRng<T>, fn: (val: T) => R): Mapper<T, R> => {
    return Mapper.new(rng, fn)
}

class Filter<T> implements InpLeftRng<T> {
    private constructor (
        private readonly _rng: InpLeftRng<T>,
        private readonly _fn: (val: T) => bool
    ) {}

    static new<T>(rng: InpLeftRng<T>, _fn: (val: T) => bool) {
        return new Filter<T>(rng, _fn)
    }

    left(): Opt<T> {
        return findItem(this._rng, this._fn)
    }

    popLeft(): [InpLeftRng<T>, Opt<T>] {
        const [newRng, result] = find(this._rng, this._fn)
        return [new Filter(newRng, this._fn), result]
    }

    withoutLeft(): InpLeftRng<T> {
        return new Filter(this._rng.withoutLeft(), this._fn)
    }

    skipLeft(amount: usize): InpLeftRng<T> {
        return new Filter(this._rng.skipLeft(amount), this._fn)
    }

    isEmpty(): bool {
        return this._rng.isEmpty()
    }

    collect<V extends OutRightRng<T>>(initialVec: V): V {
        const iterate = (rng: InpLeftRng<T>, vec: V): V => {
            const [newRng, left] = rng.popLeft()
            if (isNo(left)) return vec
            const newVec = vec.pushRight(left.val) as V
            return iterate(newRng, newVec)
        }
        return iterate(this, initialVec)
    }
}

export const filter = <T>(rng: InpLeftRng<T>, fn: (val: T) => bool): Filter<T> => {
    return Filter.new(rng, fn)
}

export const includes = <T>(rng: InpLeftRng<T>, item: T): bool => {
    return isOk(findItem(rng, (a) => a === item))
}

export const concat = <T, V extends OutRightRng<T>>(appendTo: V, appendFrom: InpLeftRng<T>): V => {
    const iterate = (appendTo: V, appendFrom: InpLeftRng<T>): V => {
        const [newFrom, left] = appendFrom.popLeft()
        if (isNo(left)) return appendTo
        const newTo = appendTo.pushRight(left.val) as V
        return iterate(newTo, newFrom)
    }
    return iterate(appendTo, appendFrom)
}

class Enumeration<T> implements InpLeftRng<[T, usize]> {
    private constructor (
        private readonly _rng: InpLeftRng<T>,
        private readonly _index: usize
    ) {}

    static new<T>(rng: InpLeftRng<T>, index: usize) {
        return new Enumeration(rng, index)
    }

    left(): Opt<[T, usize]> {
        const left = this._rng.left()
        return isOk(left)
            ? ok([left.val, this._index])
            : no()
    }

    popLeft(): [InpLeftRng<[T, usize]>, Opt<[T, usize]>] {
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

    withoutLeft(): InpLeftRng<[T, usize]> {
        return new Enumeration(this._rng.withoutLeft(), this._index + 1)
    }

    skipLeft(amount: usize): InpLeftRng<[T, usize]> {
        return new Enumeration(this._rng.skipLeft(amount), this._index + amount)
    }

    isEmpty(): bool {
        return this._rng.isEmpty()
    }

    collect<V extends OutRightRng<[T, usize]>>(initialVec: V): V {
        const iterate = (rng: InpLeftRng<[T, usize]>, vec: V): V => {
            const [newRng, left] = rng.popLeft()
            if (isNo(left)) return vec
            const newVec = vec.pushRight(left.val) as V
            return iterate(newRng, newVec)
        }
        return iterate(this, initialVec)
    }
}

export const enumerate = <T>(rng: InpLeftRng<T>, from: usize = 0): InpLeftRng<[T, usize]> => {
    return Enumeration.new(rng, from)
}

export const contains = <T>(rngA: InpLeftRng<T>, rngB: InpLeftRng<T>): bool => {
    const equal = (rngA: InpLeftRng<T>, rngB: InpLeftRng<T>): bool => {
        const [newRngB, leftB] = rngB.popLeft()
        if (isNo(leftB)) return true
        const [newRngA, leftA] = rngA.popLeft()
        if (leftA.val !== leftB.val) return false
        return equal(newRngA, newRngB)
    }

    const iterate = (rngA: InpLeftRng<T>): bool => {
        if (equal(rngA, rngB)) return true
        if (rngA.isEmpty()) return false
        return iterate(rngA.skipLeft(1))
    }
    return iterate(rngA)
}

const test = () => {
    const vec = Vec.from([1, 2, 3])
    console.log(fold(vec, 0, (acc, item) => acc + item) === 6)
    console.log(contains(vec, Vec.from([2, 3])))
    console.log(isOk(findItem(vec, (item) => item === 1)))
    console.log(isNo(findItem(vec, (item) => item === 4)))
    const [enumer1, left1] = enumerate(vec).popLeft()
    console.log(isOk(left1) && left1.val[0] === 1 && left1.val[1] === 0)
    const [_, left2] = enumer1.popLeft()
    console.log(isOk(left2) && left2.val[0] === 2 && left2.val[1] === 1)
    
    console.log(some(vec, (item) => item === 2))
    console.log(!some(vec, (item) => item === 5))
    console.log(every(vec, (item) => item < 4))
    console.log(!every(vec, (item) => item === 1))

    const str = Str.from('123')
    console.log(contains(str, Str.from('23')))
    console.log(isOk(findItem(str, (item) => item === '1')))
    console.log(isNo(findItem(str, (item) => item === '4')))

    const str2 = Str.from('fn() // __TEST_CALL__')
    console.log(contains(str2, Str.from('__TEST_CALL__')))

    const mapped = map(vec, (a) => a + 1)
    const l0 = mapped.left()
    console.log(isOk(l0) && l0.val === 2)
    const l2 = mapped.skipLeft(2).left()
    console.log(isOk(l2) && l2.val === 4)
    const mappedVec = mapped.collect(Vec.new<i32>())
    const l22 = mappedVec.getAt(2)
    console.log(isOk(l22) && l22.val === 4)

    const filtered = filter(vec, (a) => a !== 2)
    const fl0 = filtered.left()
    console.log(isOk(fl0) && fl0.val === 1)
    const fl1 = filtered.withoutLeft().left()
    console.log(isOk(fl1) && fl1.val === 3)
    const filteredVec = filtered.collect(Vec.new<i32>())
    console.log(filteredVec.len() === 2)
}
// test()