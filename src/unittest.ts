import fs from 'fs'
import { inspect } from 'util'

import { Logger } from './logger'
import { isNo } from './opt'
import { ReadSig, Sig, WriteSig } from './sig'
import { Str } from './str'
import { isEqual, isIncludes } from './utils'
import { Vec } from './vec'

const unittestEnabled = process.env.NODEENV === 'test' || process.argv.includes('--test')

interface TestNodeResult {
  isSuccessfull(): bool
}

class TestNodeContext implements TestNodeResult {
    private readonly _path: Str
    private readonly _code: Vec<Str>
    private readonly _isSuccessfull: bool
    private readonly _logger: Logger
    private readonly _log: ReadSig<Vec<Str>>
    private readonly _setLog: WriteSig<Vec<Str>>

    private constructor(path: Str, isSuccessful: bool, code: Vec<Str>) {
        this._path = path
        this._code = code
        this._isSuccessfull = isSuccessful
        ;[this._log, this._setLog] = Sig(Vec.new<Str>())
        this._logger = Logger.new((line: Str): void => {
            this._setLog(this._log().pushRight(line))
        })
    }

    static new(path: Str, isSuccessful: bool, code: Vec<Str>): TestNodeContext {
        return new TestNodeContext(path, isSuccessful, code)
    }

    path(): Str {
        return this._path
    }

    isSuccessfull(): bool {
        return this._isSuccessfull
    }

    code(): Vec<Str> {
        return this._code
    }

    log(): Vec<Str> {
        return this._log()
    }
    
    logger(): Logger {
        return this._logger
    }
}

class TestGroupContext implements TestNodeResult {
    private readonly _description: Str
    private readonly _children: ReadSig<Vec<TestNodeResult>>
    private readonly _setChildren: WriteSig<Vec<TestNodeResult>>

    private constructor(description: Str, children: Vec<TestNodeResult> = Vec.new()) {
        this._description = description
        ;[this._children, this._setChildren] = Sig(children)
    }

    static new(description: Str, children: Vec<TestNodeResult> = Vec.new()): TestGroupContext {
        return new TestGroupContext(description, children)
    }

    addChild(child: TestNodeResult): void {
        this._setChildren(this._children().pushRight(child))
    }

    description(): Str {
        return this._description
    }

    isSuccessfull(): bool {
        return this._children().every((child) => child.isSuccessfull())
    }

    children(): Vec<TestNodeResult> {
        return this._children()
    }
}

const root = TestGroupContext.new('root')
const [currentNode, setCurrentNode] = Sig(root)

const test = (description: Str, fn: () => void): void => {
    const topNode = currentNode()
    const newNode = TestGroupContext.new(description)
    topNode.addChild(newNode)
    setCurrentNode(newNode)
    fn() // __TEST_CALL__
}

export const unittest = unittestEnabled
    ? test
    : (): void => { }

// ASSERT

const readFileLines = (path: Str): Vec<Str> => {
    const alreadyLines = filesRead.get(path)
    if (alreadyLines) return alreadyLines
    const fileString = Str.from(fs.readFileSync(path.str()).toString())
    return fileString.split(/\r?\n/)
}

const removeCommonIndent = (lines: Vec<Str>): Vec<Str> => {
    const commonIndent = lines.fold(Infinity, (minIndent, line) => {
        const m = line.str().match(/\S/)
        if (!m) return minIndent
        return Math.min(minIndent, m.index!)
    })
    if (!isFinite(commonIndent)) return lines
    return lines.map((line) => line.slice((len) => [commonIndent, len]))
}

const filesRead = new Map()

const openClosedParensMap = { '{': 1, '(': 1, '[': 1 }
const closedOpenParensMap = { '}': 1, ')': 1, ']': 1 }
const getCode = (path: Str, col: usize, row: usize): Vec<Str> => {
    const lines = readFileLines(path)
    let pos = 0
    let lineIndex = row - 1
    const lineOpt = lines.get(lineIndex)
    if (isNo(lineOpt)) return Vec.new()
    // remove code before start
    const line = Str.new(col, ' ').concat(lineOpt.val.slice((len) => [col - 1, len]))
    // const startIndent = line.match(/\S/).index
    let result: Vec<Str> = Vec.new()
    let parensStack = Vec.new<Str>()
    while (true) {
        const char = line.get(pos)
        if (isNo(char)) {
            result = result.pushRight(line)
            if (parensStack.len() === 0) return result
            lineIndex++
            line = lines.get(lineIndex)!
            if (line === undefined) return result
            pos = 0
            continue
        } else if (char.val in openClosedParensMap) {
            parensStack = parensStack.pushRight(char.val)
        } else if (char.val in closedOpenParensMap) {
            parensStack = parensStack.pop()
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

const getTestStackLine = (stack: FileCodePointer[]): FileCodePointer => {
    const testCallIndex = stack.findIndex((filePointer) => filePointer.code.some((line) => {
        return line.includes('// __TEST_CALL__')
    }))!
    return stack[testCallIndex - 1]
}

const parseStack = (stack: Str): FileCodePointer[] => {
    return stack.split(/\n/)
        .filter((line) => line.includes('.ts:'))
        .map((line) => {
            const m = line.match(/.*\((.*?\.ts):(\d+):(\d+)/)!
            const path = m[1]
            const row = +m[2]
            const col = +m[3]
            const codeWithIndent = getCode(path, col, row)
            const code = removeCommonIndent(codeWithIndent)
            const file: FileCodePointer = { path, code, row, col }
            return file
        })
}


export const assert = (fn: () => bool): bool => {
    let isSuccessful = false
    try {
        isSuccessful = fn()
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.stack) {
                err.stack.split('\n').forEach((stackItem) => {
                    unitLogger.logDec(stackItem)
                })
            }
        }
    }

    const stackLines = parseStack(new Error().stack!)
    const stackLine = getTestStackLine(stackLines)

    const path = Str.from(`${stackLine.path}:${stackLine.row}:${stackLine.col}`)
    const newChild = TestNodeContext.new(
        path,
        isSuccessful,
        stackLine.code,
    )
    currentNode.addChild(newChild)
    return isSuccessful
}

export const assertEq = (fn: () => [unknown, unknown]): bool => {
    return assert(() => {
        const [a, b] = fn()
        const equal = isEqual(a, b)
        if (!equal) unitLogger.log(`\x1b[31mparsed result\n${inspect(a)}\nis not equal to \n${inspect(b)}\x1b[0m`)
        return equal
    })
}

export const assertInc = (fn: () => [unknown, unknown]): bool => {
    return assert(() => {
        const [a, b] = fn()
        const includes = isIncludes(a, b)
        if (!includes) unitLogger.log(`\x1b[31mparsed result\n${inspect(a)}\nis not includes \n${inspect(b)}\x1b[0m`)
        return includes
    })
}

const tab = '  '
let indent = ''

const addIndent = (str: Str): Str => {
    return str.split(/\n/).map((line) => line.concat(indent)).join('\n')
}

const printSuccess = (data: Str): void => {
    console.log('\x1b[32m%s\x1b[0m', addIndent(data))
}

const printError = (data: Str): void => {
    console.log('\x1b[31m%s\x1b[0m', addIndent(data))
}

const print = (data: any): void => {
    console.log(addIndent(data))
}

const withIndent = (fn: () => Und): void => {
    indent = indent + tab
    fn()
    indent = indent.slice(tab.length)
}

const printGroupOrResult = (resultOrGroup: TestNodeResult): void => {
    if (resultOrGroup instanceof TestGroupContext) {
        if (resultOrGroup.children().length === 0) return
        if (resultOrGroup.isSuccessfull()) {
            printSuccess(resultOrGroup.description().concat(':'))
        } else {
            printError(resultOrGroup.description().concat(':'))
        }
        withIndent(() => {
            resultOrGroup.children().forEach(printGroupOrResult)
        })
    } else if (resultOrGroup instanceof TestNodeContext) {
        const codeLines = resultOrGroup.code()
        if (resultOrGroup.isSuccessfull()) {
            printSuccess(codeLines.at(0)!.concat(codeLines.length > 1 ? ' ...' : ''))
        } else {
            codeLines.forEach(printError)
            withIndent(() => {
                printError(resultOrGroup.path())
                const log = resultOrGroup.log()
                if (log !== undefined) {
                    print('------------------- LOG --------------------\n')
                    log.each(print)
                }
            })
        }
    }
}

if (unittestEnabled) {
    process.on('beforeExit', () => {
        console.log('unittest results: \n')
        root.children().forEach(printGroupOrResult)
    })
}