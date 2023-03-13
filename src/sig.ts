export interface ReadSig<T> {
    (): T
}

export interface WriteSig<T> {
    (val: T): void
    with(fnUpdate: (val: T) => T): void
}

export const Sig = <T>(val: T): [ReadSig<T>, WriteSig<T>] => {
    const getter = () => val
    const setter = (v: T) => { val = v }
    setter.with = (fnUpdate: (v: T) => T) => {
        val = fnUpdate(val)
    }
    return [getter, setter]
}
