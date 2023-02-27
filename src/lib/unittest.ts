import fs from 'fs'

import { Sig, Str, Vec } from '.'

const unittestEnabled = process.env.NODE_ENV === 'test' || process.argv.includes('--test')

interface TestNodeResult {
  isSuccessfull (): bool
}

class TestNodeContext implements TestNodeResult {
  private _description: Str
  private _isSuccessfull: bool

  constructor (description: Str, isSuccessful: bool) {
    this._description = description
    this._isSuccessfull = isSuccessful
  }

  static new (description: Str, isSuccessful = true): TestNodeContext {
    return new TestNodeContext(description, isSuccessful)
  }

  withState (isSuccessful: bool): TestNodeContext {
    return (this.constructor as typeof TestGroupContext).new(
      this._description,
      isSuccessful,
    )
  }

  description (): Str {
    return this._description
  }

  isSuccessfull (): bool {
    return this._isSuccessfull
  }
}

class TestGroupContext extends TestNodeContext {
  children: Vec<TestNodeContext> = Vec.new([])

  static new (description: Str, isSuccessful = true): TestGroupContext {
    return new TestGroupContext(description, isSuccessful)
  }

  addChild (child: TestNodeContext): TestGroupContext {
    const node = TestGroupContext.new(this.description())
    node.children = node.children.push(child)
    return node
  }
  
  isSuccessfull (): bool {
    return this.children.every((child) => child.isSuccessfull())
  }
}

const root = TestGroupContext.new(Str.new('root'))
const currentNode = Sig.new(root)

const test = (description: Str, fn: () => Und): Und => {
  const topNode = currentNode.get()
  const newNode = TestGroupContext.new(description)
  currentNode.set(topNode.addChild(newNode))
  fn() // __TEST_CALL__
}

export const unittest = unittestEnabled
  ? test
  : (): Und => {}

// ASSERT

const readFileLines = (path: Str): Vec<Str> => {
  const alreadyLines = filesRead.get(path)
  if (alreadyLines) return alreadyLines
  const fileString = fs.readFileSync(path.internal()).toString()
  return Str.new(fileString).split(/\r | Und\n/)
}

const removeCommonIndent = (lines: Vec<Str>): Vec<Str> => {
  const commonIndent = lines.fold(Infinity, (minIndent, line) => {
    const m = line.internal().match(/\S/)
    if (!m) return minIndent
    return Math.min(minIndent, m.index!)
  })
  if (!isFinite(commonIndent)) return lines
  return lines.map((line) => line.slice(commonIndent))
}

interface FileCodePointer {
  path: Str
  code: Str
  row: usize
  col: usize
}

const filesRead = new Map()

const openClosedParensMap = {'{': 1, '(': 1, '[': 1}
const closedOpenParensMap = {'}': 1, ')': 1, ']': 1}
const getCode = ({path, row, col}: FileCodePointer): Vec<Str> => {
  const lines = readFileLines(path)
  let pos = 0
  let lineIndex = row - 1
  let line = lines.at(lineIndex)!
  // remove code before start
  line = Vec.len(3).join(Str.new(' ')).concat(line.slice(col - 1))
  // const startIndent = line.match(/\S/).index
  const result = Vec.new<Str>()
  const parensStack = []
  for (;;) {
    const char = line.at(pos)
    if (char === undefined) {
      result.push(line)
      if (parensStack.length === 0) return result
      lineIndex++
      line = lines.at(lineIndex)!
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

const getTestStackLine = (stack: Vec<FileCodePointer>): FileCodePointer => {
  const testCallIndex = stack.find((stackLine) => stackLine.code.includes('// __TEST_CALL__') !== und)
  return stack.at(testCallIndex - 1)
}

const parseStack = (stack: Str): Vec<FileCodePointer> => {
  return stack.split(/\n/)
    .filter((line) => line.includes('file:///'))
    .map((line) => {
      const m = line.match(/file:\/\/\/(.*):(\d+):(\d+)/)
      const file: FileCodePointer = {path: m[1], row: +m[2], col: +m[3]}
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

export const assert = (fn: () => bool): bool => {
  const isSuccessful = Sig.new(false)
  try {
    isSuccessful.set(fn())
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.stack) {
        err.stack.split('\n').forEach((stackItem) => {
          unitLogger(false, stackItem)
        })
      }
    }
  }
  const stackLine = getTestStackLine(parseStack(new Error().stack))

  currentResult.children.push({
    isSuccessful,
    at: stackLine.path + ':' + stackLine.row + ':' + stackLine.col,
    code: stackLine.code,
    log: isSuccessful ? undefined : currentLog
  })

  return isSuccessful.get()
}
