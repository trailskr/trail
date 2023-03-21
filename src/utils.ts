import { isArray, isDate, isObjectLike } from './typecheck'

export interface IsEqualOptions {
    /**
     * Optional filter function which will be executed for each key
     */
    filter?: (key: string | number, a: unknown, b: unknown) => boolean
}

export const isEqual = (a: unknown, b: unknown, options?: IsEqualOptions): boolean => {
    const filter = options?.filter
    if (isArray(b)) {
        if (!isArray(a)) return false
        if (filter) {
            const len = Math.max(a.length, b.length)
            for (let i = 0; i < len; i++) {
                if (!filter(i, a, b)) continue
                if (!isEqual(a[i], b[i], options)) return false
            }
        } else {
            if (a.length !== b.length) return false
            const len = b.length
            for (let i = 0; i < len; i++) {
                if (!isEqual(a[i], b[i], options)) return false
            }
        }
        return true
    }

    if (isDate(b)) {
        if (!a || !isDate(a)) return false
        return a.getTime() === b.getTime()
    }

    if (isObjectLike(b)) {
        if (!a || !isObjectLike(a)) return false
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (filter) {
            const checkedKeys = new Set<string>()
            for (const key of keysB) {
                checkedKeys.add(key)
                if (!filter(key, a, b)) continue
                if (!isEqual(a[key], b[key], options)) return false
            }
            for (const key of keysA) {
                if (checkedKeys.has(key)) continue
                if (!filter(key, a, b)) continue
                if (!isEqual(a[key], b[key], options)) return false
            }
        } else {
            if (keysA.length !== keysB.length) return false
            for (const key of keysB) {
                if (!isEqual(a[key], b[key], options)) return false
            }
        }
        return true
    }

    return a === b
}

export const isIncludes = (a: unknown, b: unknown, options?: IsEqualOptions): boolean => {
    const filter = options?.filter
    if (isArray(b)) {
        if (!isArray(a)) return false
        if (filter) {
            const len = Math.max(a.length, b.length)
            for (let i = 0; i < len; i++) {
                if (!filter(i, a, b)) continue
                if (!isIncludes(a[i], b[i], options)) return false
            }
        } else {
            const len = b.length
            for (let i = 0; i < len; i++) {
                if (!isIncludes(a[i], b[i], options)) return false
            }
        }
        return true
    }

    if (isDate(b)) {
        if (!a || !isDate(a)) return false
        return a.getTime() === b.getTime()
    }

    if (isObjectLike(b)) {
        if (!a || !isObjectLike(a)) return false
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (filter) {
            const checkedKeys = new Set<string>()
            for (const key of keysB) {
                checkedKeys.add(key)
                if (!filter(key, a, b)) continue
                if (!isIncludes(a[key], b[key], options)) return false
            }
            for (const key of keysA) {
                if (checkedKeys.has(key)) continue
                if (!filter(key, a, b)) continue
                if (!isIncludes(a[key], b[key], options)) return false
            }
        } else {
            for (const key of keysB) {
                if (!isIncludes(a[key], b[key], options)) return false
            }
        }
        return true
    }

    return a === b
}