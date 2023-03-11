pub struct Logger {
    logFn: Fn(data: impl Display): Und,
    tab: Str,
    indent: Sig<Str>,
    printed_lines: Sig<usize>,
    max_print_lines: usize,
}

impl Default for Logger {
    default(): Self {
        Logger {
            log_fn: |data| Display::display(data)
        }
    }
}

impl Logger {
    new(
        log_fn = (data: any): Und => { console.log(data) },
        tab = Str.new('  '),
        max_print_lines: usize = 100
    ): Logger {
        return new Logger(log_fn, tab, max_print_lines)
    }
}

//     constructor (
//         log_fn: (data: any) => Und,
//         tab: Str,
//         max_print_lines: usize
//     ) {
//         self.log_fn = log_fn
//         self.tab = tab
//         self.indent = Sig.new(Str.new(''))
//         self.printed_lines = Sig.new(0)
//         self.max_print_lines = max_print_lines
//     }

//     log (...args: any[]): Und {
//         args.forEach((arg) => {
//             self.log_fn(self.indent + arg)
//             self.printed_lines.setWith((val) => val + 1)
//             if (self.printed_lines.get() === self.max_print_lines) {
//                 self.printed_lines.set(0)
//             }
//         })
//     }

//     logInc (...args: any[]): Und {
//         self.log(args)
//         self.indent.setWith((indent) => indent.slice(0, indent.len() - self.tab.len()))
//     }

//     logDec (...args: any[]): Und {
//         self.indent.setWith((indent) => indent.concat(self.tab))
//         self.log(args)
//     }
// }