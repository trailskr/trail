import { Opt } from 'src/opt'
import { InpLeftRng } from 'src/rng'
import { Str } from 'src/str'

export namespace SearchResult {
    export enum Type {
        Found = 'Found',
        NotFound = 'NotFound',
        Error = 'Error'
    }
    export interface Found<T> { type: Type.Found, val: T }
    export interface NotFound { type: Type.NotFound }
    export interface Error { type: Type.Error, msg: Str }

    export type Self<T> = Found<T> | NotFound | Error
}

export type SearchResult<T> = SearchResult.Self<T>

export interface Searcher<T = unknown, S extends InpLeftRng<T> = InpLeftRng<T>> {
    search(rng: S): [newRng: S, result: Opt<SearchResult<T>>]
}
