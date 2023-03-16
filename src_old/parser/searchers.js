import {getNextChar} from './CodePointer.js'

export const charInRange = (from, to) => (codePointer) => {
  const [ptr, char] = getNextChar(codePointer)

  return char >= from && char <= to
    ? [ptr, char]
    : [codePointer, undefined]
}

export const char = (charToFind) => (codePointer) => {
  const [ptr, char] = getNextChar(codePointer)

  return char === charToFind
    ? [ptr, char]
    : [codePointer, undefined]
}

export const exceptChar = (charToFind, escape) => {
  if (escape === undefined) {
    return (codePointer) => {
      const [ptr, char] = getNextChar(codePointer)

      return char === charToFind
        ? [codePointer, undefined]
        : [ptr, char]
    }
  } else {
    return (codePointer) => {
      const [ptr, char] = getNextChar(codePointer)
      const esc = ptr.code[codePointer.pos - 1]

      return char === charToFind && esc !== escape
        ? [codePointer, undefined]
        : [ptr, char]
    }
  }
}

export const string = (stringToFind) => (codePointer) => {
  const len = stringToFind.length
  let ptr = codePointer
  let char
  for (let i = 0; i < len; i += 1) {
    [ptr, char] = getNextChar(ptr)

    if (char !== stringToFind[i]) {
      return [codePointer, undefined]
    }
  }

  return [ptr, stringToFind]
}

export const charRepeat = (charToFind, minTimes = 0, maxTimes = Infinity) => (codePointer) => {
  let ptr = codePointer
  let char
  let i = 0
  for (; i < maxTimes; i += 1) {
    const [pointer, c] = getNextChar(ptr)
    char = c

    if (char !== charToFind) {
      break
    } else {
      ptr = pointer
    }
  }

  return i < minTimes
    ? [codePointer, undefined]
    : [ptr, codePointer.code.slice(codePointer.pos, ptr.pos)]
}
