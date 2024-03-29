export enum OptType {
    Ok = 'Ok',
    No = 'No',
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

export const unwrap = <Y, N = void>(val?: Opt<Y, N>): Y => {
    return (val as unknown as Ok<Y>).val
}

export const isOk = <Y, N = void>(val: Opt<Y, N>): val is Ok<Y> => {
    return val.type === OptType.Ok
}

export const isNo = <Y, N = void>(val: Opt<Y, N>): val is No<N> => {
    return val.type === OptType.No
}

export const optFrom = <T>(val: T | undefined | null): Opt<T, void> => {
    return val == null ? no<T>() : ok<T>(val)
}

export const or = <T>(val: Opt<T>, def: T): T => {
    return isOk(val) ? val.val : def
}
