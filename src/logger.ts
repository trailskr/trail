import { Sig, WriteSig } from "./sig"
import { Str } from "./str"

export class Logger {
    private readonly _logFn: (str: Str) => void
    private readonly _tab: Str
    private readonly _indent: () => Str
    private readonly _setIndent: WriteSig<Str>
    private readonly _printedLines: () => usize
    private readonly _setPrintedLines: WriteSig<usize>
    private readonly _maxPrintLines: usize

    private constructor (
        logFn: (str: Str) => void = (str) => { console.log(str.str()) },
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
        logFn: (str: Str) => void = (str) => { console.log(str.str()) },
        tab: Str = Str.from('  '),
        maxPrintLines: usize = 1000
    ) {
        return new Logger(logFn, tab, maxPrintLines)
    }

    log (...args: any[]): void {
        args.forEach((arg) => {
            this._logFn(this._indent + arg)
            this._setPrintedLines.with((val) => val + 1)
            if (this._printedLines() === this._maxPrintLines) {
                this._setPrintedLines(0)
            }
        })
    }

    logInc (...args: any[]): void {
        this.log(args)
        this._setIndent.with((indent) => indent.slice((len) => [0, len - this._tab.len()]))
    }

    logDec (...args: any[]): void {
        this._setIndent.with((indent) => indent.concat(this._tab))
        this.log(args)
    }
}