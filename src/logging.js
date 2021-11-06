import {inspect} from 'util'
import {wrapParser} from './parserBase.js'

const maxPrintedLines = 1e5

export const logger = (logFn = (data) => console.log(data), tab = '  ') => {
  let indent = ''
  let printedLines = 0

  return (increaseIndent, ...args) => {
    if (!increaseIndent) {
      indent = indent.slice(0, indent.length - tab.length)
    }
    args.forEach(arg => {
      logFn(indent + arg)
      printedLines += 1
      if (printedLines === maxPrintedLines) {
        printedLines = 0
        debugger
      }
    })
    if (increaseIndent === true) {
      indent += tab
    }
  }
}

let enabled = false

export const makeLoggable = (logger) => (name, parser) => wrapParser(parser, (codePointer) => {
  if (!enabled) return parser(codePointer)
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

export const callWithLogs = (fn) => {
  enabled = true
  fn()
  enabled = false
}
