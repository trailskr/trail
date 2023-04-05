import { Opt } from 'src/opt'
import { InpLeftRng } from 'src/rng'
import { Str } from 'src/str'

export namespace SearchResult {
    export enum Type {
        Found = 'Found',
        NotFound = 'NotFound',
        Error = 'Error'
    }
    export interface Found<T, R extends InpLeftRng<T> = InpLeftRng<T>> { type: Type.Found, val: T, from: R, to: R }
    export interface NotFound { type: Type.NotFound }
    export interface Error { type: Type.Error, msg: Str }

    export type Self<T, R extends InpLeftRng<T> = InpLeftRng<T>> = Found<T, R> | NotFound | Error
}

export type SearchResult<T, R extends InpLeftRng<T> = InpLeftRng<T>> = SearchResult.Self<T, R>

export interface Searcher<T = unknown, R extends InpLeftRng<T> = InpLeftRng<T>> {
    search(rng: R): [newRng: R, result: Opt<SearchResult<T>>]
}
