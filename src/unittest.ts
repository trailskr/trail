import fs from 'fs'
import { inspect } from 'util'

import { Logger } from './logger'
import { isNo, unwrap } from './opt'
import { ReadSig, Sig, WriteSig } from './sig'
import { Str } from './str'
import { isEqual, isIncludes } from './utils'
import { Vec } from './vec'
import { Set } from './set'

const unittestEnabled = process.env.NODEENV === 'test' || process.argv.includes('--test')

interface TestNodeResult {
  isSuccessfull(): bool
  printResults(logger: Logger): void
}

class TestNodeContext implements TestNodeResult {
    private readonly _fileCodePointer: FileCodePointer
    private readonly _isSuccessfull: ReadSig<bool>
    private readonly _setIsSuccessfull: WriteSig<bool>
    private readonly _logger: Logger
    private readonly _log: ReadSig<Vec<Str>>
    private readonly _setLog: WriteSig<Vec<Str>>

    private constructor(fileCodePointer: FileCodePointer) {
        this._fileCodePointer = fileCodePointer
        ;[this._isSuccessfull, this._setIsSuccessfull] = Sig(false)
        ;[this._log, this._setLog] = Sig(Vec.new<Str>())
        this._logger = Logger.new((line: Str): void => {
            this._setLog(this._log().pushRight(line))
        })
    }

    static new(fileCodePointer: FileCodePointer): TestNodeContext {
        return new TestNodeContext(fileCodePointer)
    }

    isSuccessfull(): bool {
        return this._isSuccessfull()
    }

    setIsSuccessfull(val: bool): void {
        this._setIsSuccessfull(val)
    }

    printResults(logger: Logger) {
        const { code, fullPath, } = this._fileCodePointer
        if (this.isSuccessfull()) {
            logger.success(unwrap(code.get(0)).concat(Str.from(code.len() > 1 ? ' ...' : '')))
        } else {
            logger.error(fullPath)
            logger.withIndent(() => {
                code.for((line) => { logger.error(line) })
                const log = this._log()
                logger.log(Str.from('------------------- LOG --------------------\n'))
                log.for(line => logger.log(line))
            })
        }
    }

    run(fn: (logger: Logger) => boolean) {
        try {
            const result = fn(this._logger)
            this.setIsSuccessfull(result)
            return result
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.stack) {
                    err.stack.split('\n').forEach((stackItem) => {
                        this._logger.log(Str.from(stackItem))
                    })
                }
            }
            this.setIsSuccessfull(false)
            return false
        }
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

    isSuccessfull(): bool {
        return this._children().every((child) => child.isSuccessfull())
    }

    printResults(logger: Logger) {
        if (this._children().len() === 0) return
        const message = this._description.concat(Str.from(':'))
        if (this.isSuccessfull()) {
            logger.success(message)
        } else {
            logger.error(message)
        }
        logger.withIndent(() => {
          this._children().for((child) => child.printResults(logger))
        })
    }
}

const unittestRoot = TestGroupContext.new(Str.from('root'))
const getUnittestRootGroup = () => unittestRoot
const [currentNode, setCurrentNode] = Sig(unittestRoot)

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
    const fileString = Str.from(fs.readFileSync(path.inner()).toString())
    return fileString.split(/\r?\n/)
}

const removeCommonIndent = (lines: Vec<Str>): Vec<Str> => {
    const commonIndent = lines.fold(Infinity, (minIndent, line) => {
        const m = line.inner().match(/\S/)
        if (!m) return minIndent
        return Math.min(minIndent, m.index!)
    })
    if (!isFinite(commonIndent)) return lines
    return lines.map((line) => line.slice((len) => [commonIndent, len]))
}

const filesRead = new Map()

const openClosedParensSet = Set.from(['{', '(', '['])
const closedOpenParensSet = Set.from(['}', ')', ']'])
const getCode = (path: Str, col: usize, row: usize): Vec<Str> => {
    const lines = readFileLines(path)
    let pos = 0
    let lineIndex = row - 1
    const lineOpt = lines.get(lineIndex)
    if (isNo(lineOpt)) return Vec.new()
    // spaces before code start
    let line = Str.new(col, ' ').concat(lineOpt.val.slice((len) => [col - 1, len]))
    let result: Vec<Str> = Vec.new()
    let parensStack = Vec.new<char>()
    while (true) {
        const char = line.get(pos)
        if (isNo(char)) {
            result = result.pushRight(line)
            if (parensStack.len() === 0) return result
            lineIndex++
            const nextLine = lines.get(lineIndex)
            if (isNo(nextLine)) return result
            pos = 0
            line = nextLine.val
            continue
        } else if (openClosedParensSet.has(char.val)) {
            parensStack = parensStack.pushRight(char.val)
        } else if (closedOpenParensSet.has(char.val)) {
            parensStack = parensStack.skipRight(1)
        }
        pos++
    }
}

interface FileCodePointer {
  path: Str
  code: Vec<Str>
  col: usize
  row: usize
  fullPath: Str
}

const getTestStackLineFilePointer = (stack: Vec<FileCodePointer>): FileCodePointer => {
    const testCallIndex = unwrap(stack.findKey((filePointer) => filePointer.code.some((line) => {
        return line.includes(Str.from('// __TEST_CALL__'))
    })))
    return unwrap(stack.get(testCallIndex - 1))
}

const parseStack = (stack: Str): Vec<FileCodePointer> => {
    return stack.split(/\n/)
        .filter((line) => line.includes(Str.from('.ts:')))
        .map((line) => {
            const m = line.inner().match(/.*\((.*?\.ts):(\d+):(\d+)/)!
            const path = Str.from(m[1])
            const row = +m[2]
            const col = +m[3]
            const codeWithIndent = getCode(path, col, row)
            const code = removeCommonIndent(codeWithIndent)
            const fullPath = Str.from(`${path.inner()}:${row}:${col}`)
            const file: FileCodePointer = { path, code, row, col, fullPath }
            return file
        })
}

export const assert = (fn: (logger: Logger) => bool): bool => {
    const stackLines = parseStack(Str.from(new Error().stack!))
    const stackLinePointer = getTestStackLineFilePointer(stackLines)
    const testNodeContext = TestNodeContext.new(stackLinePointer)
    currentNode().addChild(testNodeContext)
    return testNodeContext.run(fn)
}

export const assertEq = (fn: (logger: Logger) => [unknown, unknown]): bool => {
    return assert((logger) => {
        const [a, b] = fn(logger)
        logger.log(Str.from('----------------- END LOG ------------------\n'))
        const equal = isEqual(a, b)
        if (!equal) {
            logger.error(Str.from(`parsed result\n${inspect(a)}\nis not equal to \n${inspect(b)}`))
        }
        return equal
    })
}

export const assertInc = (fn: (logger: Logger) => [unknown, unknown]): bool => {
    return assert((logger) => {
        const [a, b] = fn(logger)
        logger.log(Str.from('----------------- END LOG ------------------\n'))
        const includes = isIncludes(a, b)
        if (!includes) {
            logger.error(Str.from(`parsed result\n${inspect(a)}\nis not includes \n${inspect(b)}`))
        }
        return includes
    })
}

if (unittestEnabled) {
    process.on('beforeExit', () => {
        console.log('unittest results: \n')
        getUnittestRootGroup().printResults(Logger.new())
    })
}