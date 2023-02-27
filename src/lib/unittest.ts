import fs from 'fs'

import { Sig, Str, Vec } from '.'

const unittestEnabled = process.env.NODE_ENV === 'test' || process.argv.includes('--test')

interface TestNodeResult {
  isSuccessfull (): bool
}

class TestNodeContext implements TestNodeResult {
  private _at: Str
  private _isSuccessfull: bool
  private _code: Vec<Str>
  // private _log: Vec<Str>

  constructor (at: Str, isSuccessful: bool, code: Vec<Str>) {
    this._at = at
    this._isSuccessfull = isSuccessful
    this._code = code
  }

  static new (at: Str, isSuccessful = true, code: Vec<Str>): TestNodeContext {
    return new TestNodeContext(at, isSuccessful, code)
  }

  withState (isSuccessful: bool): TestNodeContext {
    return TestNodeContext.new(
      this._at,
      isSuccessful,
      this._code,
    )
  }

  at (): Str {
    return this._at
  }

  isSuccessfull (): bool {
    return this._isSuccessfull
  }

  code (): Vec<Str> {
    return this._code
  }
}

class TestGroupContext implements TestNodeResult {
  private _description: Str
  private _children: Vec<TestNodeResult> = Vec.new([])

  constructor (description: Str) {
    this._description = description
  }

  static new (description: Str): TestGroupContext {
    return new TestGroupContext(description)
  }

  addChild (child: TestNodeResult): TestGroupContext {
    const node = TestGroupContext.new(this.description())
    node._children = node._children.push(child)
    return node
  }

  description (): Str {
    return this._description
  }
  
  isSuccessfull (): bool {
    return this._children.every((child) => child.isSuccessfull())
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
  const fileString = fs.readFileSync(path._()).toString()
  return Str.new(fileString).split(/\r?\n/)
}

const removeCommonIndent = (lines: Vec<Str>): Vec<Str> => {
  const commonIndent = lines.fold(Infinity, (minIndent, line) => {
    const m = line._().match(/\S/)
    if (!m) return minIndent
    return Math.min(minIndent, m.index!)
  })
  if (!isFinite(commonIndent)) return lines
  return lines.map((line) => line.slice(commonIndent))
}

const filesRead = new Map()

const openClosedParensMap = {'{': 1, '(': 1, '[': 1}
const closedOpenParensMap = {'}': 1, ')': 1, ']': 1}
const getCode = (path: Str, col: usize, row: usize): Vec<Str> => {
  const lines = readFileLines(path)
  let pos = 0
  let lineIndex = row - 1
  let line = lines.at(lineIndex)!
  // remove code before start
  line = Vec.len(col).join(Str.new(' ')).concat(line.slice(col - 1))
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

interface FileCodePointer {
  path: Str
  code: Vec<Str>
  col: usize
  row: usize
}

const getTestStackLine = (stack: Vec<FileCodePointer>): FileCodePointer => {
  const testCallIndex = stack.find((filePointer) => filePointer.code.some((line) => {
    return line._().includes('// __TEST_CALL__') !== und
  }))!
  return stack.at(testCallIndex[1] - 1)!
}

const parseStack = (stack: Str): Vec<FileCodePointer> => {
  return stack.split(/\n/)
    .filter((line) => line._().includes('.ts:'))
    .map((line) => {
      const m = line._().match(/.*\((.*?\.ts):(\d+):(\d+)/)!
      const path = Str.new(m[1])
      const row = +m[2]
      const col = +m[3]
      const code = removeCommonIndent(getCode(path, col, row))
      const file: FileCodePointer = { path, code, row, col }
      return file
    })
}

// const currentLog = sig()

// const isLogEnabled = false
// const unitLog = (data) => {
//   if (isLogEnabled) currentLog.push(data)
// }

// export const unitLogger = logger(unitLog)
// const callWithLogs = (fn) => {
//   isLogEnabled = true
//   fn()
//   isLogEnabled = false
// }

export const assert = (fn: () => bool): bool => {
  const isSuccessful = Sig.new(false)
  try {
    isSuccessful.set(fn())
  } catch (err: unknown) {
    // if (err instanceof Error) {
    //   if (err.stack) {
    //     err.stack.split('\n').forEach((stackItem) => {
    //       unitLogger(false, stackItem)
    //     })
    //   }
    // }
  }

  const stackLine = getTestStackLine(parseStack(Str.new(new Error().stack!)))

  const row = Str.new(stackLine.row.toString())
  const col = Str.new(stackLine.col.toString())
  const colon = Str.new(':')
  const path = stackLine.path.concat(colon).concat(row).concat(colon).concat(col)
  const newChild = TestNodeContext.new(
    path,
    isSuccessful.get(),
    stackLine.code,
    // log: isSuccessful ? undefined : currentLog
  )
  const node = currentNode.get().addChild(newChild)
  currentNode.set(node)

  return isSuccessful.get()
}
