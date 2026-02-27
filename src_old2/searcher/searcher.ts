import { Opt } from 'src_old2/opt'
import { InpLeftRng } from 'src_old2/rng'
import { Str } from 'src_old2/str'

export namespace SearchResult {
    export enum Type {
        Found = 'Found',
        NotFound = 'NotFound',
        Error = 'Error'
    }
    export interface Found<T, U = T, R extends InpLeftRng<T> = InpLeftRng<T>> { type: Type.Found, val: U, from: R, to: R }
    export interface NotFound { type: Type.NotFound }
    export interface Error { type: Type.Error, msg: Str }

    export type Self<T, U = T, R extends InpLeftRng<T> = InpLeftRng<T>> = Found<T, U, R> | NotFound | Error
}

export type SearchResult<T, U = T, R extends InpLeftRng<T> = InpLeftRng<T>> = SearchResult.Self<T, U, R>

export interface Searcher<T, U = T, R extends InpLeftRng<T> = InpLeftRng<T>> {
    search(rng: R): [newRng: R, result: Opt<SearchResult<T, U, R>>]
}
