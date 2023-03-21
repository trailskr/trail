import { TokenStream } from '../tokenizer/token-stream'

export enum FindResult {
    Found = 'Found',
    NotEnded = 'NotEnded',
    NotFound = 'NotFound',
}

export interface Finder {
    parse(tokenStream: TokenStream): [newTokenStream: TokenStream, result: FindResult]
}