import { CodePtr } from './code-ptr';

export enum SearchResult {
    Found = 'Found',
    NotEnded = 'NotEnded',
    NotFound = 'NotFound',
}

export interface Searcher {
    parse(codePtr: CodePtr): [newCodePtr: CodePtr, result: SearchResult]
}