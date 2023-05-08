import { Set as ImmSet } from 'immutable'

export class Set<T> {
    private readonly _set: ImmSet<T>
    
    private constructor(set: ImmSet<T>) {
        this._set = set
    }

    static new () {
        return Set.from([])
    }

    static from<T>(rec: T[]): Set<T> {
        return new Set(ImmSet(rec))
    }

    add(key: T): Set<T> {
        return new Set(this._set.add(key))
    }

    has (item: T): bool {
        return this._set.includes(item)
    }

    len (): usize {
        return this._set.size
    }

    isEmpty(): boolean {
        return this.len() === 0
    }

    inner (): ImmSet<T> {
        return this._set
    }

    toString (): string {
        return this._set.toSet().toString()
    }
}
