import {wrapParser} from './parserBase.js'
import {inspect} from 'util'

export const makeLoggableParserWrapper = (logger) => (name, parser) => wrapParser(parser, (codePointer) => {
  logger(true, `parsing ${name} ${codePointer.row}:${codePointer.col}`)
  const result = parser(codePointer)
  const [ptr, res] = result
  if (res === undefined) {
    logger(false, `not parsed ${name}`)
  } else {
    logger(false, `parsed ${name} ${ptr.row}:${ptr.col} ${inspect(res, {depth: Infinity, breakLength: Infinity})}`)
  }
  return result
})
