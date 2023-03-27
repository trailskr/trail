import { CharStream } from './char-stream';

export enum SearchResult {
    Found = 'Found',
    NotEnded = 'NotEnded',
    NotFound = 'NotFound',
}

export interface Searcher {
    parse(charStream: CharStream): [newCharStream: CharStream, result: SearchResult]
}