import { isOk, Opt, optFrom, or } from './opt'
import { findItem, RandomAccessFiniteRng } from './rng'
import { Slice } from './slice'
import { Vec } from './vec'

export class Str implements RandomAccessFiniteRng<char> {
    private readonly _str: string

    private constructor(str: string) {
        this._str = str
    }

    static new<T>(len = 0, init = ' '): Str {
        const str = Array(len).join(init)
        return new Str(str)
    }

    static from (str: string): Str {
        return new Str(str)
    }

    left (): Opt<char> {
        return optFrom(this._str[0])
    }

    right (): Opt<char> {
        return optFrom(this._str[this._str.length - 1])
    }
    
    popLeft (): [Str, Opt<char>] {
        return [new Str(this._str.slice(1)), this.left()]
    }

    popRight (): [Str, Opt<char>] {
        return [new Str(this._str.slice(0, -1)), this.right()]
    }

    withoutLeft(): Str {
        return new Str(this._str.slice(1))
    }

    skipLeft (amount: usize): Str {
        return new Str(this._str.slice(amount))
    }

    withoutRight(): Str {
        return new Str(this._str.slice(0, -1))
    }

    skipRight (amount: usize): Str {
        return new Str(this._str.slice(0, -amount))
    }

    slice (fn: (len: usize) => Slice): Str {
        const len = this.len()
        const slice = fn(len)
        return new Str(this._str.slice(or(slice.left(), 0), or(slice.right(), len)))
    }

    has (item: char): bool {
        return isOk(findItem(this, (a) => a === item))
    }

    getAt (index: usize): Opt<char> {
        return optFrom(this._str[index])
    }

    setAt (index: usize, val: char): Str {
        return Str.from(this._str.slice(0, index) + val + this._str.slice(index))
    }

    len (): usize {
        return this._str.length
    }

    isEmpty(): boolean {
        return this.len() === 0
    }

    pushRight (val: char): Str {
        const str = [...this._str]
        str.push(val)
        return new Str(str.join(''))
    }

    pushLeft (val: char): Str {
        const str = [...this._str]
        str.unshift(val)
        return new Str(str.join(''))
    }

    split (regExpOrString: RegExp | Str): Vec<Str> {
        const val = regExpOrString instanceof Str ? regExpOrString.inner() : regExpOrString
        return Vec.from(this._str.split(val).map((str) => new Str(str)))
    }

    replace (regExpOrString: RegExp | Str, replaceValue: Str): Str {
        const val = regExpOrString instanceof Str ? regExpOrString.inner() : regExpOrString
        return Str.from(this._str.replaceAll(val, replaceValue.inner()))
    }

    match (regExpOrString: RegExp | Str): Opt<RegExpMatchArray> {
        const val = regExpOrString instanceof Str ? regExpOrString.inner() : regExpOrString
        return optFrom(this._str.match(val))
    }

    inner(): string {
        return this._str
    }

    toString(): string {
        return this._str
    }
}