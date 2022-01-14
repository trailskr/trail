import fs from 'fs'
import {logger} from './logging.js'

const unittestEnabled = process.env.NODE_ENV === 'test' || process.argv.includes('--test')

const Group = (description) => ({description, children: [], isSuccessful: true})

const root = Group('root')
let currentResult = root

export const unittest = unittestEnabled
  ? (description, fn) => {
    const topResult = currentResult
    currentResult = Group(description)
    topResult.children.push(currentResult)
    fn() // __TEST_CALL__
    currentResult.isSuccessful = currentResult.children.every(resultOrGroup => resultOrGroup.isSuccessful)
    currentResult = topResult
  }
  : () => {}

const filesRead = new Map()
const readFileLines = (path) => {
  const alreadyLines = filesRead.get(path)
  if (alreadyLines) return alreadyLines
  const fileLines = fs.readFileSync(path).toString().split(/\r?\n/)
  filesRead.set(path, fileLines)
  return fileLines
}

const removeCommonIndent = (lines) => {
  const commonIndent = lines.reduce((minIndent, line) => {
    const m = line.match(/\S/)
    if (!m) return minIndent
    return Math.min(minIndent, m.index)
  }, Infinity)
  if (!isFinite(commonIndent)) return lines
  return lines.map(line => line.slice(commonIndent))
}

const openClosedParensMap = {'{': 1, '(': 1, '[': 1}
const closedOpenParensMap = {'}': 1, ')': 1, ']': 1}
const getCode = ({path, row, col}) => {
  const lines = readFileLines(path)
  let pos = 0
  let lineIndex = row - 1
  let line = lines[lineIndex]
  // remove code before start
  line = new Array(col).join(' ') + line.slice(col - 1)
  // const startIndent = line.match(/\S/).index
  const result = []
  const parensStack = []
  while (true) {
    const char = line[pos]
    if (char === undefined) {
      result.push(line)
      if (parensStack.length === 0) return result
      lineIndex++
      line = lines[lineIndex]
      if (line === undefined) return result
      pos = 0
      continue
    } else if (char in openClosedParensMap) {
      parensStack.push(char)
    } else if (char in closedOpenParensMap) {
      parensStack.pop()
    }
    pos++
  }
}

const getTestStackLine = (stack) => {
  const testCallIndex = stack.findIndex(stackLine => stackLine.code.includes('// __TEST_CALL__'))
  return stack[testCallIndex - 1]
}

const parseStack = (stack) => {
  return stack.split(/\n/)
    .filter(line => line.includes('file:///'))
    .map(line => {
      const m = line.match(/file:\/\/\/(.*):(\d+):(\d+)/)
      const file = {path: m[1], row: +m[2], col: +m[3]}
      file.code = removeCommonIndent(getCode(file)).join('\n')
      return file
    })
}

let currentLog

let isLogEnabled = false
const unitLog = (data) => {
  if (isLogEnabled) currentLog.push(data)
}

export const unitLogger = logger(unitLog)
const callWithLogs = (fn) => {
  isLogEnabled = true
  fn()
  isLogEnabled = false
}

export const assert = (expressionFn) => {
  currentLog = []
  callWithLogs(() => {
    let isSuccessful
    try {
      isSuccessful = expressionFn() === true
    } catch (err) {
      isSuccessful = false
      err.stack.split('\n').forEach((stackItem) => {
        unitLogger(false, stackItem)
      })
    }
    const stackLine = getTestStackLine(parseStack(new Error().stack))

    currentResult.children.push({
      isSuccessful,
      at: stackLine.path + ':' + stackLine.row + ':' + stackLine.col,
      code: stackLine.code,
      log: isSuccessful ? undefined : currentLog.join('\n')
    })
  })
}

const addIndent = (str) => str.split('\n').map(line => indent + line).join('\n')
const printSuccess = (data) => console.log('\x1b[32m%s\x1b[0m', addIndent(data))
const printError = (data) => console.log('\x1b[31m%s\x1b[0m', addIndent(data))
const print = (data, isSuccessful) => {
  if (isSuccessful == null) console.log(addIndent(data))
  else if (isSuccessful) printSuccess(data)
  else printError(data)
}

const tab = '  '
let indent = ''

const withIndent = (fn) => {
  indent += tab
  fn()
  indent = indent.slice(tab.length)
}

const printGroupOrResult = (resultOrGroup) => {
  if (resultOrGroup.children) {
    if (resultOrGroup.children.length === 0) return
    print(resultOrGroup.description + ':', resultOrGroup.isSuccessful)
    withIndent(() => {
      resultOrGroup.children.forEach(printGroupOrResult)
    })
  } else {
    if (resultOrGroup.isSuccessful) {
      const codeLines = resultOrGroup.code.split('\n')
      print(codeLines[0] + (codeLines.length > 1 ? ' ...' : ''), true)
    } else {
      print(resultOrGroup.code, false)
      withIndent(() => {
        print(resultOrGroup.at, false)
        if (resultOrGroup.log) {
          print('------------------- LOG --------------------\n' + resultOrGroup.log)
        }
      })
    }
  }
}

if (unittestEnabled) {
  process.on('beforeExit', () => {
    console.log('unittest results: \n')
    root.children.forEach(printGroupOrResult)
  })
}
