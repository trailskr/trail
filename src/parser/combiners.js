const saveParsers = (parsers, p) => {
  p.parsers = parsers
  return p
}

export const any = (...parsers) => saveParsers(parsers, (codePointer) => {
  for (const parser of parsers) {
    const [ptr, result] = parser(codePointer)
    if (result === undefined) {
      continue
    }
    return [ptr, result]
  }
  return [codePointer, undefined]
})

export const repeatToString = (parser, minTimes = 0, maxTimes = Infinity) => (codePointer) => {
  let result = ''
  let ptr = codePointer
  let i = 0
  for (; i < maxTimes; i += 1) {
    const [pointer, res] = parser(ptr)
    if (res === undefined) {
      break
    } else {
      result += res
      ptr = pointer
    }
  }
  return i < minTimes
    ? [codePointer, undefined]
    : [ptr, result]
}

export const repeat = (parser, minTimes = 0, maxTimes = Infinity) => (codePointer) => {
  let result = []
  let ptr = codePointer
  let i = 0
  for (; i < maxTimes; i += 1) {
    const [pointer, res] = parser(ptr)
    if (res === undefined) {
      break
    } else {
      result.push(res)
      ptr = pointer
    }
  }
  return i < minTimes
    ? [codePointer, undefined]
    : [ptr, result]
}

export const sequenceToString = (...parsers) => saveParsers(parsers, (codePointer) => {
  let result = ''
  let ptr = codePointer
  const len = parsers.length
  for (let i = 0; i < len; i += 1) {
    const parser = parsers[i]
    const [pointer, res] = parser(ptr)
    if (res === undefined) {
      if (parser.optional) {
        continue
      } else {
        return [codePointer, undefined]
      }
    }
    ptr = pointer
    if (!parser.skip) {
      result += res
    }
  }
  return result.length > 0
    ? [ptr, result]
    : [codePointer, undefined]
})

export const sequence = (...parsers) => saveParsers(parsers, (codePointer) => {
  const result = []
  let ptr = codePointer
  const len = parsers.length
  for (let i = 0; i < len; i += 1) {
    const parser = parsers[i]
    const [pointer, res] = parser(ptr)
    if (res === undefined) {
      if (parser.optional) {
        result.push(undefined)
        continue
      } else {
        return [codePointer, undefined]
      }
    }
    ptr = pointer
    if (!parser.skip) {
      result.push(res)
    }
  }
  return result.length > 0
    ? [ptr, result]
    : [codePointer, undefined]
})
