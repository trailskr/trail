
export interface ReadSig<T> {
    get (): T
}

export interface WriteSig<T> {
    set (val: T): Und
    setWith (fnUpdate: (val: T) => T): Und
}

export class Sig<T> implements ReadSig<T>, WriteSig<T> {
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

    setWith (fnUpdate: (val: T) => T): Und {
        this._val = fnUpdate(this.get())
    }
}
