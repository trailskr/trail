const makeBinding = (target, source, property) => {
  Object.defineProperty(target, property, {
    get() { return source[property] },
    set(v) { source[property] = v }
  })
}

export const wrapParser = (parser, wrapperParser) => {
  wrapperParser.parsers = parser.parsers
  makeBinding(wrapperParser, parser, 'optional')
  makeBinding(wrapperParser, parser, 'skip')
  return wrapperParser
}

export const switchableWrapParser = (parser, wrapperParser) => {
  let isEnabled

  const resultParser = wrapParser(parser, (codePointer) => {
    if (!isEnabled) return parser(codePointer)
    return wrapperParser(codePointer)
  })

  Object.defineProperty(resultParser, 'enabled', {
    get() { return isEnabled },
    set(v) { isEnabled = v }
  })

  return resultParser
}

export const optional = (parser) => {
  const wrapperParser = (...args) => parser(...args)
  wrapperParser.parsers = parser.parsers
  wrapperParser.optional = true
  makeBinding(wrapperParser, parser, 'skip')
  return wrapperParser
}

export const skip = (parser) => {
  const wrapperParser = (...args) => parser(...args)
  wrapperParser.parsers = parser.parsers
  wrapperParser.skip = true
  makeBinding(wrapperParser, parser, 'optional')
  return wrapperParser
}

export const twoPointersToPosition = (ptrFrom, ptrTo) => {
  return {
    from: {col: ptrFrom.col, row: ptrFrom.row},
    to: {col: ptrTo.col, row: ptrTo.row}
  }
}

export const transform = (parser, transformerFn) => wrapParser(parser, (codePointer) => {
  const [ptr, res] = parser(codePointer)
  return res === undefined && !parser.optional
    ? [codePointer, undefined]
    : [ptr, transformerFn(res, twoPointersToPosition(codePointer, ptr))]
})

export const transformResult = (parser, transformerFn) => wrapParser(parser, (codePointer) => {
  const [ptr, res] = parser(codePointer)
  return res === undefined && !parser.optional
    ? [codePointer, undefined]
    : [ptr, transformerFn(res)]
})
