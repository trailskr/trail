export interface Logger {
    logFn: (str: string) => void
    tab: string
    indent: string
}

export const newLogger = (
    logFn: (str: string) => void = (str): void => { console.log(str) },
    tab = '  '
): Logger => {
    return { logFn, tab, indent: ''}
}

const addIndent = (str: string, indent: string): string => {
    return str.split(/\n/).map((line) => indent + line).join('\n')
}

export const log = (logger: Logger, str: string): void => {
    logger.logFn(addIndent(str, logger.indent))
}

const greenString = (data: string): string => {
    return `\x1b[32m${data}\x1b[0m`
}

const redString = (data: string): string => {
    return `\x1b[31m${data}\x1b[0m`
}

export const logSuccess = (logger: Logger, str: string): void => {
    log(logger, greenString(str))
}

export const logError = (logger: Logger, str: string): void => {
    log(logger, redString(str))
}

export const logInc = (logger: Logger): Logger => {
    return { ...logger, indent: logger.indent + logger.tab }
}

export const logDec = (logger: Logger): Logger => {
    return { ...logger, indent: logger.indent.slice(0, -logger.tab.length) }
}

export const logWithIndent = (logger: Logger, fn: (logger: Logger) => void): void => {
    const newLogger = logInc(logger)
    fn(newLogger)
}
