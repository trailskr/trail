import { Set as ImmSet } from 'immutable'
import { no, ok, Opt, optFrom, or } from './opt'

import { RandomAccessFiniteRng } from './rng'
import { Slice } from './slice'

export class Set<T> implements RandomAccessFiniteRng<T, T> {
    private readonly _set: ImmSet<T>
    
    private constructor(set: ImmSet<T>) {
        this._set = set
    }

    static new () {
        return Set.from([])
    }

    static from<T>(rec: T[]): Set<T> {
        return new Set(ImmSet(rec))
    }

    left (): Opt<T> {
        return optFrom(this._set.first())
    }

    right (): Opt<T> {
        return optFrom(this._set.last())
    }

    popLeft (): [Set<T>, Opt<T>] {
        const last = optFrom(this._set.last())
        const rest = new Set(this._set.skip(1))
        return [rest, last]
    }

    popRight (): [Set<T>, Opt<T>] {
        const last = optFrom(this._set.last())
        const rest = new Set(this._set.butLast())
        return [rest, last]
    }

    skipLeft (amount: usize): Set<T> {
        return new Set(this._set.skip(amount))
    }

    skipRight (amount: usize): Set<T> {
        return new Set(this._set.skipLast(amount))
    }

    get(key: T): Opt<T> {
        return this.has(key) ? ok(key) : no()
    }

    set(key: T, val: T): Set<T> {
        return new Set(this._set.add(key))
    }

    pushRight (val: T): Set<T> {
        return new Set(this._set.add(val))
    }

    pushLeft (val: T): Set<T> {
        return new Set(this._set.add(val))
    }

    has (item: T): bool {
        return this._set.includes(item)
    }

    slice (fn: (len: usize) => Slice<usize>): Set<T> {
        const len = this.len()
        const slice = fn(len)
        return new Set(this._set.slice(or(slice.left(), 0), or(slice.right(), len)))
    }

    len (): usize {
        return this._set.size
    }

    isEmpty(): boolean {
        return this.len() === 0
    }

    inner (): ImmSet<T> {
        return this._set
    }

    toString (): string {
        return this._set.toSet().toString()
    }
}
