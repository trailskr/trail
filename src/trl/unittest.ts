// import fs from 'fs'

// import { Logger } from './logger'

// import { Sig, Str, Vec } from '.'

// const unittestEnabled = process.env.NODE_ENV === 'test' || process.argv.includes('--test')

// interface TestNodeResult {
//   isSuccessfull (): bool
// }

// class TestNodeContext implements TestNodeResult {
//   private readonly _path: Str
//   private readonly _isSuccessfull: bool
//   private readonly _code: Vec<Str>
//   private _log: Vec<Str> | Und

//   constructor (path: Str, isSuccessful: bool, code: Vec<Str>, log: Vec<Str> | Und) {
//     this._path = path
//     this._isSuccessfull = isSuccessful
//     this._code = code
//     this._log = log
//   }

//   static new (at: Str, isSuccessful = true, code: Vec<Str>, log: Vec<Str> | Und): TestNodeContext {
//     return new TestNodeContext(at, isSuccessful, code, log)
//   }

//   withState (isSuccessful: bool): TestNodeContext {
//     return TestNodeContext.new(
//       this._path,
//       isSuccessful,
//       this._code,
//       this._log,
//     )
//   }

//   path (): Str {
//     return this._path
//   }

//   isSuccessfull (): bool {
//     return this._isSuccessfull
//   }

//   code (): Vec<Str> {
//     return this._code
//   }

//   log (): Vec<Str> | Und {
//     return this._log
//   }
// }

// class TestGroupContext implements TestNodeResult {
//   private readonly _description: Str
//   private readonly _children: Vec<TestNodeResult>

//   constructor (description: Str, children: Vec<TestNodeResult>) {
//     this._description = description
//     this._children = children
//   }

//   static new (description: Str, children: Vec<TestNodeResult> = Vec.new()): TestGroupContext {
//     return new TestGroupContext(description, children)
//   }

//   addChild (child: TestNodeResult): TestGroupContext {
//     return TestGroupContext.new(
//       this.description(),
//       this._children.push(child)
//     )
//   }

//   description (): Str {
//     return this._description
//   }

//   isSuccessfull (): bool {
//     return this._children.every((child) => child.isSuccessfull())
//   }

//   children (): Vec<TestNodeResult> {
//     return this._children
//   }
// }

// const rootGroup = TestGroupContext.new(Str.new('root'))
// const currentNode = Sig.new(rootGroup)
// const root = currentNode

// const test = (description: Str, fn: () => Und): Und => {
//   const topNode = currentNode.get()
//   const isRoot = root.get() === topNode
//   const newNode = TestGroupContext.new(description)
//   const newTop = topNode.addChild(newNode)
//   currentNode.set(newTop)
//   if (isRoot) {
//     root.set(newTop)
//   }
//   fn() // __TEST_CALL__
// }

// export const unittest = unittestEnabled
//   ? test
//   : (): Und => {}

// // ASSERT

// const readFileLines = (path: Str): Vec<Str> => {
//   const alreadyLines = filesRead.get(path)
//   if (alreadyLines) return alreadyLines
//   const fileString = fs.readFileSync(path._()).toString()
//   return Str.new(fileString).split(/\r?\n/)
// }

// const removeCommonIndent = (lines: Vec<Str>): Vec<Str> => {
//   const commonIndent = lines.fold(Infinity, (minIndent, line) => {
//     const m = line._().match(/\S/)
//     if (!m) return minIndent
//     return Math.min(minIndent, m.index!)
//   })
//   if (!isFinite(commonIndent)) return lines
//   return lines.map((line) => line.slice(commonIndent))
// }

// const filesRead = new Map()

// const openClosedParensMap = {'{': 1, '(': 1, '[': 1}
// const closedOpenParensMap = {'}': 1, ')': 1, ']': 1}
// const getCode = (path: Str, col: usize, row: usize): Vec<Str> => {
//   const lines = readFileLines(path)
//   let pos = 0
//   let lineIndex = row - 1
//   let line = lines.at(lineIndex)!
//   // remove code before start
//   line = Vec.len(col).join(Str.new(' ')).concat(line.slice(col - 1))
//   // const startIndent = line.match(/\S/).index
//   const result = Sig.new(Vec.new<Str>())
//   const parensStack = []
//   for () {
//     const char = line.at(pos)
//     if (char === undefined) {
//       result.set(result.get().push(line))
//       if (parensStack.length === 0) return result.get()
//       lineIndex++
//       line = lines.at(lineIndex)!
//       if (line === undefined) return result.get()
//       pos = 0
//       continue
//     } else if (char in openClosedParensMap) {
//       parensStack.push(char)
//     } else if (char in closedOpenParensMap) {
//       parensStack.pop()
//     }
//     pos++
//   }
// }

// interface FileCodePointer {
//   path: Str
//   code: Vec<Str>
//   col: usize
//   row: usize
// }

// const getTestStackLine = (stack: Vec<FileCodePointer>): FileCodePointer => {
//   const testCallIndex = stack.find((filePointer) => filePointer.code.some((line) => {
//     return line._().includes('// __TEST_CALL__')
//   }))!
//   return stack.at(testCallIndex[1] - 1)!
// }

// const parseStack = (stack: Str): Vec<FileCodePointer> => {
//   return stack.split(/\n/)
//     .filter((line) => line._().includes('.ts:'))
//     .map((line) => {
//       const m = line._().match(/.*\((.*?\.ts):(\d+):(\d+)/)!
//       const path = Str.new(m[1])
//       const row = +m[2]
//       const col = +m[3]
//       const codeWithIndent = getCode(path, col, row)
//       const code = removeCommonIndent(codeWithIndent)
//       const file: FileCodePointer = { path, code, row, col }
//       return file
//     })
// }

// const currentLog = Sig.new(Vec.new<Str>())
// const isLogEnabled = Sig.new(false)
// const unitLog = (data: any): Und => {
//   if (isLogEnabled) currentLog.set(currentLog.get().push(data))
// }

// export const unitLogger = Logger.new(unitLog)
// const callWithLogs = (fn: () => Und): Und => {
//   isLogEnabled.set(true)
//   fn()
//   isLogEnabled.set(false)
// }

// export const assert = (fn: () => bool): bool => {
//   currentLog.set(Vec.new())
//   const isSuccessful = Sig.new(false)
//   callWithLogs(() => {
//     try {
//       isSuccessful.set(fn())
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         if (err.stack) {
//           err.stack.split('\n').forEach((stackItem) => {
//             unitLogger.logDec(stackItem)
//           })
//         }
//       }
//     }

//     const stackLines = parseStack(Str.new(new Error().stack!))
//     const stackLine = getTestStackLine(stackLines)

//     const row = Str.new(stackLine.row.toString())
//     const col = Str.new(stackLine.col.toString())
//     const colon = Str.new(':')
//     const path = stackLine.path.concat(colon).concat(row).concat(colon).concat(col)
//     const newChild = TestNodeContext.new(
//       path,
//       isSuccessful.get(),
//       stackLine.code,
//       isSuccessful ? undefined : currentLog.get(),
//     )
//     const node = currentNode.get().addChild(newChild)
//     currentNode.set(node)
//   })
//   return isSuccessful.get()
// }

// const tab = Str.new('  ')
// const indent = Sig.new(Str.new(''))

// const addIndent = (str: Str): Str => {
//   return str.split(/\n/).map((line) => line.concat(indent.get())).join(Str.new('\n'))
// }

// const printSuccess = (data: Str): Und => {
//   console.log('\x1b[32m%s\x1b[0m', addIndent(data))
// }

// const printError = (data: Str): Und => {
//   console.log('\x1b[31m%s\x1b[0m', addIndent(data))
// }

// const print = (data: any): Und => {
//   console.log(addIndent(data))
// }

// const withIndent = (fn: () => Und): Und => {
//   indent.setWith((indent) => indent.concat(tab))
//   fn()
//   indent.setWith((indent) => indent.slice(tab.len()))
// }

// const printGroupOrResult = (resultOrGroup: TestNodeResult): Und => {
//   if (resultOrGroup instanceof TestGroupContext) {
//     if (resultOrGroup.children().len() === 0) return
//     if (resultOrGroup.isSuccessfull()) {
//       printSuccess(resultOrGroup.description().concat(Str.new(':')))
//     } else {
//       printError(resultOrGroup.description().concat(Str.new(':')))
//     }
//     withIndent(() => {
//       resultOrGroup.children().each(printGroupOrResult)
//     })
//   } else if (resultOrGroup instanceof TestNodeContext) {
//     const codeLines = resultOrGroup.code()
//     if (resultOrGroup.isSuccessfull()) {
//       printSuccess(codeLines.at(0)!.concat(Str.new(codeLines.len() > 1 ? ' ...' : '')))
//     } else {
//       codeLines.each(printError)
//       withIndent(() => {
//         printError(resultOrGroup.path())
//         const log = resultOrGroup.log()
//         if (log !== und) {
//           print('------------------- LOG --------------------\n')
//           log.each(print)
//         }
//       })
//     }
//   }
// }

// if (unittestEnabled) {
//   process.on('beforeExit', () => {
//     console.log('unittest results: \n')
//     root.get().children().each(printGroupOrResult)
//   })
// }
