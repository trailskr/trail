import { Err } from './err'
import { isNo, isOk, no, ok, Opt } from './opt'
import { Slice } from './slice'
import { Str } from './str'
import type { Vec } from './vec'

export interface InpLeftRng<K, T> {
    left(): Opt<T>
    popLeft(): [InpLeftRng<K, T>, Opt<T>]
    skipLeft(amount: usize): InpLeftRng<K, T>
    isEmpty(): bool
}

export interface InpRndAccRngInfinite<K, T> extends InpLeftRng<K, T> {
    get(key: K): Opt<T>
}

export interface InpBidirRng<K, T> extends InpLeftRng<K, T> {
    right(): Opt<T>
    popRight(): [InpBidirRng<K, T>, Opt<T>]
    skipRight(amount: usize): InpBidirRng<K, T>
}

export interface InpRndAccRngFinite<K, T> extends InpBidirRng<K, T> {
    get(key: K): Opt<T>
    len(): usize
    slice (fn: (len: usize) => Slice<usize>): InpRndAccRngFinite<K, T>
}

export interface OutRightRng<K, T> {
    pushRight(val: T): OutRightRng<K, T>
}

export interface OutBidirRngLeft<K, T> extends OutRightRng<K, T> {
    pushLeft(val: T): OutBidirRngLeft<K, T>
}

export const fold = <K, T, R>(rng: InpLeftRng<K, T>, initialValue: R, fn: (acc: R, item: T, stop: () => void) => R): R => {
    let stop = false
    const iterate = (res: R, rng: InpLeftRng<K, T>): R => {
        const [newRange, left] = rng.popLeft()
        if (isNo(left)) return res
        const ans = fn(res, left.val, () => { stop = true })
        if (stop) return res
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

export const map = <R, K, T, V extends OutRightRng<K, R> = Vec<R>>(rng: InpLeftRng<K, T>, fn: (val: T) => R, initialVec: V): V => {
    const iterate = (rng: InpLeftRng<K, T>, vec: V): V => {
        const [newRng, left] = rng.popLeft()
        if (isNo(left)) return vec
        const newVec = vec.pushRight(fn(left.val)) as V
        return iterate(newRng, newVec)
    }
    return iterate(rng, initialVec)
}

export const filter = <K, T, V extends OutRightRng<K, T> = Vec<T>>(rng: InpLeftRng<K, T>, fn: (val: T) => bool, initialVec: V): V => {
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

// export const includes = <K, T>(rngA: InpLeftRng<K, T>, rngB: InpLeftRng<K, T>): bool => {
//     let [restB, leftB] = rngB.popLeft()
//     if (isNo(leftB)) return true
//     return fold(rngA, false, (_, item, stop) => {
//         if (leftB.val === item) {
//             const everyEqual = fold(restB, true, (_, item, stop) => {
//                 if (item !== ) {
//                     stop()
//                     return false
//                 }
//                 return true
//             })
//             if (every(restB, (item) => item == ) {
                
//             }
//             stop()
//             return true
//         }
//         return false
//     })
// }
