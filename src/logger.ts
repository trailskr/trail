import { Sig, WriteSig } from "./sig"
import { Str } from "./str"

const addIndent = (str: Str, indent: Str): Str => {
    return str.split(/\n/).map((line) => indent.concat(line)).join(Str.from('\n'))
}

const greenStr = (data: Str): Str => {
    return Str.from('\x1b[32m').concat(data).concat(Str.from('\x1b[0m'))
}

const redStr = (data: Str): Str => {
    return Str.from('\x1b[31m').concat(data).concat(Str.from('\x1b[0m'))
}

export class Logger {
    private readonly _logFn: (str: Str) => void
    private readonly _tab: Str
    private readonly _indent: () => Str
    private readonly _setIndent: WriteSig<Str>
    private readonly _printedLines: () => usize
    private readonly _setPrintedLines: WriteSig<usize>
    private readonly _maxPrintLines: usize

    private constructor (
        logFn: (str: Str) => void = (str) => { console.log(str.inner()) },
        tab: Str = Str.from('  '),
        maxPrintLines: usize = 1000
    ) {
        this._logFn = logFn
        this._tab = tab
        ;[this._indent, this._setIndent] = Sig(Str.from(''))
        ;[this._printedLines, this._setPrintedLines] = Sig(0)
        this._maxPrintLines = maxPrintLines
    }

    static new (
        logFn: (str: Str) => void = (str) => { console.log(str.inner()) },
        tab: Str = Str.from('  '),
        maxPrintLines: usize = 1000
    ) {
        return new Logger(logFn, tab, maxPrintLines)
    }

    log (str: Str): void {
        this._logFn(addIndent(str, this._indent()))
        this._setPrintedLines.with((val) => val + 1)
        if (this._printedLines() === this._maxPrintLines) {
            this._setPrintedLines(0)
        }
    }

    success(str: Str): void {
        this.log(greenStr(str))
    }

    error(str: Str): void {
        this.log(redStr(str))
    }

    inc (): void {
        this._setIndent.with((indent) => indent.concat(this._tab))
    }

    dec (): void {
        this._setIndent.with((indent) => indent.slice((len) => [0, len - this._tab.len()]))
    }

    withIndent (fn: () => void) {
        this.inc()
        fn()
        this.dec()
    }
}