export class Sig<T> {
    private _val: T

    constructor (val: T) {
        this._val = val
    }

    static new<T> (val: T): Sig<T> {
        return new Sig<T>(val)
    }

    get (): T {
        return this._val
    }

    set (val: T): Und {
        this._val = val
    }
}
