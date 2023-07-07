interface CodePtr {
    code: string
    pos: number
    row: number
    col: number
}

const codePtr = (code: string): CodePtr => ({ code, pos: 0, row: 0, col: 0 })

const nextChar = (ptr: CodePtr): [char, CodePtr] => {
    const { code, pos, row, col } = ptr
    if (pos >= code.length) {
        return ['\0', ptr]
    }
    const char = code[pos]
    const isNewLine = char === '\n'
    const newPtr = isNewLine
        ? { code, pos: pos + 1, row: row + 1, col: 0 }
        : { code, pos: pos + 1, row, col: col + 1 }
    return [char, newPtr]
}

interface CharInRange {
    from: char
    to: char
}

const charInRange = (from: char, to: char): CharInRange => ({ from, to })

interface Any<Args extends unknown[]> {
    variants: Args
}

const any = <Args extends unknown[]>(...args: Args): Any<Args> => ({ variants: args })

interface Opt<T> {
    val: T
}

const opt = <T>(val: T): Opt<T> => ({ val })

interface Seq<Args extends unknown[]> {
    sequence: Args
}

const seq = <Args extends unknown[]>(...args: Args): Seq<Args> => ({ sequence: args })

interface Repeat<T> {
    val: T
    minTimes: usize
    maxTimes: usize
}

const repeat = <T>(val: T, minTimes = 0, maxTimes = 0): Repeat<T> => ({ val, minTimes, maxTimes })

const mul = '*'
const div = '/'
const plus = '+'
const minus = '-'

const zero = '0'
const nonZeroDecimalDigit = charInRange('1', '9')
const decimalDigit = charInRange('0', '9')

const decimalInteger = any(
    zero,
    opt(
        seq(
            nonZeroDecimalDigit,
            repeat(decimalDigit)
        )
    )
)

const binaryOperator = any(
    any(mul, div),
    any(plus, minus)
)

const unaryOperator = any(plus, minus)

const code = '2 + 2 * 2'
const ptr = codePtr(code)

const [char, nextPtr] = nextChar(ptr)
