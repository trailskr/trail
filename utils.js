/**
 * Глубоко подмешивает все собственные поля объекта в другой, сохраняя
 * данные верхних уровней, если они уже существуют в исходном объекте.
 * Копирует undefined поля, если их нет, но не затирает уже имеющиеся.
 * @param {Object|Array} to - Получатель
 * @param {Object|Array} from - Источник
 * @param {Function<to, from, key>} [fn] - Опциональная функция перехватчик
 *   Если функция передана то она будет выполнена для каждого вызова
 *   Если функция возвращаёт true выполнение ветки прекращается
 * @param {boolean} [concatArrays] - Если указан - массивы одного уровня будут соеденены
 * @return {Object|Array} to - Получатель
 */
module.exports.deepMerge = function deepMerge(to, from, fn, concatArrays) {
  function deepMerge(to, from, key) {
    if (fn && fn(to, from, key) === true) {
      return to
    }
    let field = from[key]

    if (field === undefined) {
      if (!(key in to)) {
        to[key] = field
      }
    } else if (typeof (field) !== 'object' || field === null) {
      to[key] = field
      return
    }

    let i, len, keys

    // Handle Array
    if (Array.isArray(field)) {
      if (!Array.isArray(to[key])) {
        to[key] = []
      }
      if (concatArrays) {
        to[key] = from[key].concat(to[key])
      } else {
        for (i = 0, len = field.length; i < len; i++) {
          deepMerge(to[key], field, i, concatArrays)
        }
      }
      return
    }

    // Handle Object
    if (typeof field === 'object') {
      if (!to[key] || !(to[key] instanceof Object)) {
        to[key] = Object.create(Object.getPrototypeOf(field))
      }
      keys = Object.keys(field)
      for (i = 0, len = keys.length; i < len; i++) {
        deepMerge(to[key], field, keys[i], concatArrays)
      }
    }
  }

  if (typeof (from) !== 'object' || from == null) {
    return to
  }

  let i, len

  // Handle Array
  if (Array.isArray(from) && Array.isArray(to)) {
    if (concatArrays) {
      to = from.concat(to)
    } else {
      for (i = 0, len = from.length; i < len; i++) {
        deepMerge(to, from, i, concatArrays)
      }
    }
    return to
  }

  // Handle Object
  if (typeof from === 'object' && typeof to === 'object') {
    let keys = Object.keys(from)
    for (i = 0, len = keys.length; i < len; i++) {
      let k = keys[i]
      deepMerge(to, from, k, concatArrays)
    }
    return to
  }

  return to
}

/**
 * Глубоко клонирует все собственные поля объекта в новый
 * @param {Object|Array} from - Источник
 * @param {Function<copy, from, key>} [fn] - Опциональная функция перехватчик
 *   Если функця передана то она будет выполнена для каждого вызова
 *   Если функция возвращаёт true выполнение ветки прекращается
 * @param {Boolean} [withSort] - Отсортировать ключи в объекте результата по алфавиту
 * @return {Object|Array} to - Получатель
 */
module.exports.deepClone = function deepClone(from, fn, withSort) {
  if (typeof (from) !== 'object' || from == null) {
    return from
  }

  let copy, i, len, keys

  // Handle Array
  if (Array.isArray(from)) {
    copy = []
    for (i = 0, len = from.length; i < len; i++) {
      copy[i] = deepClone(from[i], fn, withSort)
    }
    return copy
  }

  // Handle Object
  if (typeof from === 'object') {
    copy = Object.create(Object.getPrototypeOf(from))
    keys = Object.keys(from)
    if (withSort) keys = keys.sort((a, b) => a < b ? -1 : 1)
    for (i = 0, len = keys.length; i < len; i++) {
      let k = keys[i]
      if (fn && fn(copy, from, k) === true) {
        continue
      }
      copy[k] = deepClone(from[k], fn, withSort)
    }
    return copy
  }
}

/**
 * Проверяет равенство объектов по содержимому
 * @param a операнд 1
 * @param b операнд 2
 * @returns {boolean}
 */
module.exports.equals = function equals(a, b) {
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
    if (typeof b === 'object') {
      if (!a || !(typeof a === 'object')) {
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
