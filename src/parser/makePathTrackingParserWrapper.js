import {wrapParser} from './parserBase.js'

export const pendingSymbol = Symbol('pending')

export const makePathTrackingParserWrapper = (logger, pathTracking) => (name, parser) => wrapParser(parser, (codePointer) => {
  const pathTrackMap = pathTracking[codePointer.pos] || (pathTracking[codePointer.pos] = {})
  const pathTrack = pathTrackMap[name]
  if (pathTrack) {
    if (pathTrack === pendingSymbol) {
      // recursion occurred
      logger(undefined, `recursion occured ${name} ${codePointer.row}:${codePointer.col}`)
      return undefined
    }
    logger(undefined, `return parsed from path tracking of ${name} ${codePointer.row}:${codePointer.col}`)
    return pathTrack
  }
  pathTrackMap[name] = pendingSymbol
  const result = parser(codePointer)
  pathTrackMap[name] = result
  return result
})
