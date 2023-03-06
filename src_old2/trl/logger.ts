import { Sig, Str } from '.'

export class Logger {
    private readonly _logFn: (data: any) => Und
    private readonly _tab: Str
    private readonly _indent: Sig<Str>
    private readonly _printedLines: Sig<usize>
    private readonly _maxPrintLines: usize

    constructor (
        logFn: (data: any) => Und,
        tab: Str,
        maxPrintLines: usize
    ) {
        this._logFn = logFn
        this._tab = tab
        this._indent = Sig.new(Str.new(''))
        this._printedLines = Sig.new(0)
        this._maxPrintLines = maxPrintLines
    }

    static new (
        logFn = (data: any): Und => { console.log(data) },
        tab = Str.new('  '),
        maxPrintLines: usize = 100
    ): Logger {
        return new Logger(logFn, tab, maxPrintLines)
    }

    log (...args: any[]): Und {
        args.forEach((arg) => {
            this._logFn(this._indent + arg)
            this._printedLines.setWith((val) => val + 1)
            if (this._printedLines.get() === this._maxPrintLines) {
                this._printedLines.set(0)
            }
        })
    }

    logInc (...args: any[]): Und {
        this.log(args)
        this._indent.setWith((indent) => indent.slice(0, indent.len() - this._tab.len()))
    }

    logDec (...args: any[]): Und {
        this._indent.setWith((indent) => indent.concat(this._tab))
        this.log(args)
    }
}