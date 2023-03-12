import assert from "assert"

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

export type Opt<Y, N = void> = Ok<Y> | No<N>

export const ok = <Y, N = void>(val: Y): Opt<Y, N> => {
    return {
        type: OptType.Ok,
        val
    }
}

export const no = <Y, N = void>(val?: N): Opt<Y, N> => {
    return {
        type: OptType.No,
        val: val!
    }
}

export const isOk = <Y, N = void>(val: Opt<Y, N>): val is Ok<Y> => {
    return val.type === OptType.Ok
}

export const isNo = <Y, N = void>(val: Opt<Y, N>): val is No<N> => {
    return val.type === OptType.No
}

export const optFrom = <T>(val: T | undefined): Opt<T, void> => {
    return val === undefined ? no<T>() : ok<T>(val)
}