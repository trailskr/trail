import { Rng } from './rng'

export class Str implements Rng<char> {
    private _str: char

    constructor (str: char) {
        this._str = str
    }

    static new (str: char): Str {
        return new Str(str)
    }

    popLeft (): [Str, char] {
        return [Str.new(this._str.slice(1)), this._str[0]]
    }

    every (fn: (item: char) => bool): bool {
        return [...this._str].every(fn)
    }
}
