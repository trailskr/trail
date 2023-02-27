import { Rng, Vec } from '.'

export class Str implements Rng<char> {
    private _str: string

    constructor (str: string) {
        this._str = str
    }

    static new (str: string): Str {
        return new Str(str)
    }

    popLeft (): [Str, char] {
        return [Str.new(this._str.slice(1)), this._str[0]]
    }

    popRight (): [Str, char | Und] {
        const last = this._str[this._str.length - 1]
        return [Str.new(this._str.slice(1)), last as char | Und]
    }

    pop (): [Str, char | Und] {
        return this.popRight()
    }

    left (): char | Und {
        return this._str[0]
    }

    right (): char | Und {
        return this._str[this._str.length - 1]
    }

    every (fn: (item: string, key: usize) => bool): bool {
        return [...this._str].every(fn)
    }

    internal (): string {
        return this._str
    }

    split (regExp: RegExp): Vec<Str> {
        return Vec.new(this._str.split(regExp).map((str) => Str.new(str)))
    }
}
