import {wrapParser} from './parserBase.js'

export const makePathTrackingParserWrapper = (logger, {order, nameMaps}) => (name, parser) => wrapParser(parser, (codePointer) => {
  const pathTrackMap = nameMaps[codePointer.pos] || (nameMaps[codePointer.pos] = {})
  const pathTrack = pathTrackMap[name]
  const lastParserName = order[order.length - 1]
  if (pathTrack) {
    if (typeof pathTrack === 'string') {
      if (pathTrack === lastParserName) {
        // recursion occurred
        logger(undefined, `recursion occured ${name} ${codePointer.row}:${codePointer.col}`)
        return [codePointer, undefined]
      }
    } else {
      logger(undefined, `return parsed from path tracking of ${name} ${codePointer.row}:${codePointer.col}`)
      return pathTrack
    }
  }
  pathTrackMap[name] = lastParserName
  order.push(name)
  const result = parser(codePointer)
  order.pop()
  if (result[1] !== undefined) {
    pathTrackMap[name] = result
  } else {
    delete pathTrackMap[name]
  }
  return result
})
