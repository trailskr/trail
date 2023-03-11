export enum OptType {
    Ok,
    No,
}

export interface Ok<T> {
    type: OptType.Ok
    val: T
}

export interface No<T = void> {
    type: OptType.No
    val: T
}

export class Opt<Y, N = void> {
    val: Ok<Y> | No<N>

    constructor(val: Ok<Y> | No<N>) {
        this.val = val
    }
}

export const Ok = <Y, N = void>(val: Y): Opt<Y, N> => {
    return new Opt<Y, N>({
        type: OptType.Ok,
        val
    })
}

export const No = <Y, N>(val?: N): Opt<Y, N> => {
    return new Opt<Y, N>({
        type: OptType.No,
        val: val!
    })
}
