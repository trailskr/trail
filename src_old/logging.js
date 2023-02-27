const maxPrintedLines = 100

export const logger = (logFn = (data) => console.log(data), tab = '  ') => {
  let indent = ''
  let printedLines = 0

  return (increaseIndent, ...args) => {
    if (increaseIndent === false) {
      indent = indent.slice(0, indent.length - tab.length)
    }
    args.forEach((arg) => {
      logFn(indent + arg)
      printedLines += 1
      if (printedLines === maxPrintedLines) {
        printedLines = 0
      }
    })
    if (increaseIndent === true) {
      indent += tab
    }
  }
}
