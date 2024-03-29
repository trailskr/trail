import { List } from 'immutable'
import { Opt, optFrom, or } from './opt'
import { RandomAccessFiniteRng } from './rng'

import { Slice } from './slice'
import { Str } from './str'

export class Vec<T> implements RandomAccessFiniteRng<T> {
    private readonly _arr: List<T>

    private constructor(list: List<T>) {
        this._arr = list
    }

    static new<T>(len = 0, init = 0): Vec<T> {
        const arr = Array(len)
        for (let i = 0; i < len; i++) {
            arr[i] = init
        }
        return new Vec(List(arr))
    }

    static from<T>(arr: T[]): Vec<T> {
        return new Vec(List(arr))
    }

    left(): Opt<T> {
        return optFrom(this._arr.get(0))
    }

    right(): Opt<T> {
        return optFrom(this._arr.get(this.len() - 1))
    }

    popLeft(): [Vec<T>, Opt<T>] {
        const first = optFrom(this._arr.first())
        const rest = new Vec(this._arr.shift())
        return [rest, first]
    }

    popRight(): [Vec<T>, Opt<T>] {
        const last = optFrom(this._arr.last())
        const rest = new Vec(this._arr.pop())
        return [rest, last]
    }

    withoutLeft(): Vec<T> {
        return new Vec(this._arr.skip(1))
    }

    skipLeft(amount: usize): Vec<T> {
        return new Vec(this._arr.skip(amount))
    }

    withoutRight(): Vec<T> {
        return new Vec(this._arr.skip(1))
    }

    skipRight(amount: usize): Vec<T> {
        return new Vec(this._arr.skipLast(amount))
    }

    slice(fn: (len: usize) => Slice): Vec<T> {
        const len = this.len()
        const slice = fn(len)
        return new Vec(this._arr.slice(or(slice.left(), 0), or(slice.right(), len)))
    }

    len(): usize {
        return this._arr.size
    }

    isEmpty(): bool {
        return this.len() === 0
    }

    pushRight(val: T): Vec<T> {
        return new Vec(this._arr.push(val))
    }

    pushLeft(val: T): Vec<T> {
        return new Vec(this._arr.unshift(val))
    }

    getAt(index: usize): Opt<T> {
        return optFrom(this._arr.get(index))
    }

    setAt(index: usize, val: T): Vec<T> {
        return new Vec(this._arr.set(index, val))
    }

    join(val: Str): Str {
        return Str.from(this._arr.join(val.inner()))
    }

    inner(): T[] {
        return this._arr.toArray()
    }

    toString(): string {
        return this._arr.toArray().toString()
    }

    valueOf(): T[] {
        return this._arr.toArray()
    }
}
