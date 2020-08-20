export function equals(a, b) {
  function compare(a, b) {
    let i, len

    // Handle Array
    if (Array.isArray(b)) {
      if (!Array.isArray(a)) {
        return false
      }
      if (a.length !== b.length) return false
      for (i = 0, len = b.length; i < len; i++) {
        if (!compare(a[i], b[i])) return false
      }
      return true
    }

    // Handle Object
    if (b instanceof Object) {
      if (!a || !(a instanceof Object)) {
        return false
      }
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false
      for (i = 0, len = keysB.length; i < len; i++) {
        const key = keysB[i]
        if (!compare(a[key], b[key])) return false
      }
      return true
    }

    return a === b
  }

  return compare(a, b)
}

export function includes(a, b) {
  function compare(a, b) {
    let i, len

    // Handle Array
    if (Array.isArray(b)) {
      if (!Array.isArray(a)) {
        return false
      }
      if (a.length !== b.length) return false
      for (i = 0, len = b.length; i < len; i++) {
        if (!compare(a[i], b[i])) return false
      }
      return true
    }

    // Handle Object
    if (b instanceof Object) {
      if (!a || !(a instanceof Object)) {
        return false
      }
      const keysB = Object.keys(b)
      for (i = 0, len = keysB.length; i < len; i++) {
        const key = keysB[i]
        if (!compare(a[key], b[key])) return false
      }
      return true
    }

    return a === b
  }

  return compare(a, b)
}
