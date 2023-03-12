import fs from 'fs'
import { inspect } from 'util'

import { Logger } from './logger'
import { isEqual, isIncludes } from './utils'

const unittestEnabled = process.env.NODEENV === 'test' || process.argv.includes('--test')

interface TestNodeResult {
  isSuccessfull(): bool
}

class TestNodeContext implements TestNodeResult {
    private readonly _path: string
    private readonly _code: string[]
    private _isSuccessfull: bool
    private _log: string[] | Und

    constructor(path: string, isSuccessful: bool, code: string[], log: string[] | Und) {
        this._path = path
        this._code = code
        this._isSuccessfull = isSuccessful
        this._log = log
    }

    path(): string {
        return this._path
    }

    isSuccessfull(): bool {
        return this._isSuccessfull
    }

    code(): string[] {
        return this._code
    }

    log(): string[] | Und {
        return this._log
    }
}

class TestGroupContext implements TestNodeResult {
    private readonly _description: string
    private _children: TestNodeResult[]

    constructor(description: string, children: TestNodeResult[] = []) {
        this._description = description
        this._children = children
    }

    addChild(child: TestNodeResult): void {
        this._children.push(child)
    }

    description(): string {
        return this._description
    }

    isSuccessfull(): bool {
        return this._children.every((child) => child.isSuccessfull())
    }

    children(): TestNodeResult[] {
        return this._children
    }
}

const root = new TestGroupContext('root')
const currentNode = root

const test = (description: string, fn: () => Und): void => {
    const topNode = currentNode
    const newNode = new TestGroupContext(description)
    topNode.addChild(newNode)
    fn() // __TEST_CALL__
}

export const unittest = unittestEnabled
    ? test
    : (): void => { }

// ASSERT

const readFileLines = (path: string): string[] => {
    const alreadyLines = filesRead.get(path)
    if (alreadyLines) return alreadyLines
    const fileString = fs.readFileSync(path).toString()
    return fileString.split(/\r?\n/)
}

const removeCommonIndent = (lines: string[]): string[] => {
    const commonIndent = lines.reduce((minIndent, line) => {
        const m = line.match(/\S/)
        if (!m) return minIndent
        return Math.min(minIndent, m.index!)
    }, Infinity)
    if (!isFinite(commonIndent)) return lines
    return lines.map((line) => line.slice(commonIndent))
}

const filesRead = new Map()

const openClosedParensMap = { '{': 1, '(': 1, '[': 1 }
const closedOpenParensMap = { '}': 1, ')': 1, ']': 1 }
const getCode = (path: string, col: usize, row: usize): string[] => {
    const lines = readFileLines(path)
    let pos = 0
    let lineIndex = row - 1
    let line = lines[lineIndex]
    // remove code before start
    line = [...Array(col)].join(' ') + line.slice(col - 1)
    // const startIndent = line.match(/\S/).index
    const result: string[] = []
    const parensStack = []
    for (; ;) {
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
  path: string
  code: string[]
  col: usize
  row: usize
}

const getTestStackLine = (stack: FileCodePointer[]): FileCodePointer => {
    const testCallIndex = stack.findIndex((filePointer) => filePointer.code.some((line) => {
        return line.includes('// __TEST_CALL__')
    }))!
    return stack[testCallIndex - 1]
}

const parseStack = (stack: string): FileCodePointer[] => {
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

let currentLog: string[] = []
let isLogEnabled = false
const unitLog = (line: string): void => {
    if (isLogEnabled) currentLog.push(line)
}

export const unitLogger = new Logger(unitLog)
const callWithLogs = (fn: () => Und): void => {
    isLogEnabled = true
    fn()
    isLogEnabled = false
}

export const assert = (fn: () => bool): bool => {
    currentLog = []
    let isSuccessful = false
    callWithLogs(() => {
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

        const row = stackLine.row.toString()
        const col = stackLine.col.toString()
        const path = `${stackLine.path}:${row}:${col}`
        const newChild = new TestNodeContext(
            path,
            isSuccessful,
            stackLine.code,
            isSuccessful ? undefined : currentLog,
        )
        currentNode.addChild(newChild)
    })
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

const addIndent = (str: string): string => {
    return str.split(/\n/).map((line) => line.concat(indent)).join('\n')
}

const printSuccess = (data: string): void => {
    console.log('\x1b[32m%s\x1b[0m', addIndent(data))
}

const printError = (data: string): void => {
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
                    log.forEach(print)
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