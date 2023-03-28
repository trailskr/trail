import { Opt } from 'src/opt'
import { Str } from 'src/str'

export enum SearchResultType {
    Found = 'Found',
    NotEnded = 'NotEnded',
    NotFound = 'NotFound',
}

export interface Found<T> { type: SearchResultType.Found, val: T } 
export interface NotEnded { type: SearchResultType.NotEnded, msg: Str } 
export interface NotFound { type: SearchResultType.NotFound }

export type SearchResult<T> = Found<T> | NotEnded | NotFound 

export interface SearchStream<T> {
    popLeft(): [SearchStream<T>, Opt<T>]
}

export interface Searcher<T, K, S extends SearchStream<K>> {
    search(charStream: S): [newCharStream: S, result: SearchResult<T>]
}