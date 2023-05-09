import fs from 'fs'
import { inspect as utilInspect } from 'util'

import { Logger, log, logError, logSuccess, logWithIndent, newLogger } from './logger'
import { isEqual, isIncludes } from './utils'

const unittestEnabled = process.env.NODEENV === 'test' || process.argv.includes('--test')

const inspect = (data: unknown): string => {
    return utilInspect(data, false, null)
}

interface FileCodePointer {
    path: string
    code: string[]
    col: usize
    row: usize
    fullPath: string
}

interface TestRunContext {
    fileCodePointer: FileCodePointer
    isSuccessfull: bool
    logger: Logger
    logMessages: string[]
}

const newTestRunContext = (fileCodePointer: FileCodePointer): TestRunContext => {
    const log: string[] = []
    return {
        fileCodePointer,
        isSuccessfull: false,
        logMessages: log,
        logger: newLogger((line: string): void => {
            log.push(line)
        })
    }
}

const printRunResults = (testRunContext: TestRunContext, logger: Logger): void => {
    const { code, fullPath } = testRunContext.fileCodePointer
    if (testRunContext.isSuccessfull) {
        logWithIndent(logger, (logger) => {
            code.forEach((line) => { logSuccess(logger, line) })
        })
    } else {
        logError(logger, fullPath)
        logWithIndent(logger, (logger) => {
            code.forEach((line) => { logError(logger, line) })
            const logMessages = testRunContext.logMessages
            if (logMessages.length > 0) {
                logMessages.forEach((line) => log(logger, line))
            }
        })
    }
}

const run = (testRunContext: TestRunContext, fn: (logger: Logger) => boolean): bool => {
    try {
        const result = fn(testRunContext.logger)
        testRunContext.isSuccessfull = result
        return result
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (!err.stack) return false
            err.stack.split('\n').forEach((stackItem) => {
                log(testRunContext.logger, stackItem)
            })
        }
        testRunContext.isSuccessfull = false
        return false
    }
}

interface TestGroupContext {
    description: string
    children: TestContext[]
}

type TestContext = TestGroupContext | TestRunContext

const newTestGroupContext = (description: string): TestGroupContext => {
    return { description, children: [] }
}

const addChild = (testGroupContext: TestGroupContext, child: TestContext): void => {
    testGroupContext.children.push(child)
}

const isSuccessfull = (testContext: TestContext): bool => {
    if ('isSuccessfull' in testContext) return testContext.isSuccessfull
    return testContext.children.every(isSuccessfull)
}

const printGroupResults = (testGroupContext: TestGroupContext, logger: Logger): void => {
    if (testGroupContext.children.length === 0) return
    const message = `${testGroupContext.description}:`
    if (isSuccessfull(testGroupContext)) {
        logSuccess(logger, message)
    } else {
        logError(logger, message)
    }
    logWithIndent(logger, (logger) => {
        testGroupContext.children.forEach((child) => {
            if ('children' in child) {
                printGroupResults(child, logger)
            } else {
                printRunResults(child, logger)
            }
        })
    })
}

const unittestRootContext = newTestGroupContext('root')
let currentGroupContext: TestGroupContext = unittestRootContext

const test = (description: string, fn: () => void): void => {
    const topGroupContext = currentGroupContext
    const newGroupContext = newTestGroupContext(description)
    addChild(topGroupContext, newGroupContext)
    currentGroupContext = newGroupContext
    fn() // __TEST_CALL__
    currentGroupContext = topGroupContext
}

export const unittest = unittestEnabled
    ? test
    : (): void => {}

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

const openClosedParensSet = ['{', '(', '[']
const closedOpenParensSet = ['}', ')', ']']
const getCode = (path: string, col: usize, row: usize): string[] => {
    const lines = readFileLines(path)
    let pos = 0
    let lineIndex = row - 1
    const lineOpt = lines[lineIndex]
    if (lineOpt == null) return []
    // spaces before code start
    let line = ` ${lineOpt.slice(col - 1)}`
    const result: string[] = []
    const parensStack: char[] = []
    for (;;) {
        const char = line[pos]
        if (char == null) {
            result.push(line)
            if (parensStack.length === 0) return result
            lineIndex++
            const nextLine = lines[lineIndex]
            if (nextLine == null) return result
            pos = 0
            line = nextLine
            continue
        } else if (openClosedParensSet.includes(char)) {
            parensStack.push(char)
        } else if (closedOpenParensSet.includes(char)) {
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
    fullPath: string
}

const getTestStackLineFilePointer = (stack: FileCodePointer[]): FileCodePointer => {
    const foundIndex = stack.findIndex((filePointer) => filePointer.code.some((line) => {
        return line.includes('// __TEST_CALL__')
    }))
    return stack[foundIndex - 1]
}

const tsFileLineMathRe = /.*\((.*?\.ts):(\d+):(\d+)/

const parseStack = (stack: string): FileCodePointer[] => {
    const linesWithTs = stack.split(/\n/).filter((line) => tsFileLineMathRe.test(line))
    return linesWithTs.map((line) => {
        const m = line.match(tsFileLineMathRe)!
        const path = m[1]
        const row = +m[2]
        const col = +m[3]
        const codeWithIndent = getCode(path, col, row)
        const code = removeCommonIndent(codeWithIndent)
        const fullPath = `${path}:${row}:${col}`
        return { path, code, row, col, fullPath }
    })
}

export const assert = (fn: (logger: Logger) => bool): bool => {
    const stackLines = parseStack(new Error().stack!)
    const stackLinePointer = getTestStackLineFilePointer(stackLines)
    const testRunContext = newTestRunContext(stackLinePointer)
    addChild(currentGroupContext, testRunContext)
    return run(testRunContext, fn)
}

export const assertEq = <T>(fn: (logger: Logger) => [T, T]): bool => {
    return assert((logger) => {
        const [a, b] = fn(logger)
        const equal = isEqual(a, b)
        if (!equal) {
            logError(logger, `result\n${inspect(a)}\nis not equal to \n${inspect(b)}`)
        }
        return equal
    })
}

export const assertInc = <T>(fn: (logger: Logger) => [T, Partial<T>]): bool => {
    return assert((logger) => {
        const [a, b] = fn(logger)
        const includes = isIncludes(a, b)
        if (!includes) {
            logError(logger, `result\n${inspect(a)}\nis not includes \n${inspect(b)}`)
        }
        return includes
    })
}

if (unittestEnabled) {
    process.on('beforeExit', () => {
        console.log('unittest results: \n')
        printGroupResults(unittestRootContext, newLogger())
    })
}
