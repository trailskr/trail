import {assert, unittest} from './unittests.js'

export const CodePointer = (code) => {
  return {
    code,
    pos: 0,
    col: 1,
    row: 1
  }
}

export const getNextChar = (codePointer) => {
  const {code, pos, col, row} = codePointer

  const char = code[pos]

  const newLine = char === '\n'

  return [
    {
      code,
      pos: pos + 1,
      col: newLine ? 0 : col + 1,
      row: newLine ? row + 1 : row
    },
    char
  ]
}

unittest(() => {
  const code = `\
hello
world`

  let p = CodePointer(code)

  assert(p.pos === 0)
  assert(p.row === 1)
  assert(p.col === 1)

  let char
  ;[p, char] = getNextChar(p)

  assert(p.pos === 1)
  assert(p.row === 1)
  assert(p.col === 2)
  assert(char === 'h')

  for (let i = 0; i < 10; i += 1) {
    const r = getNextChar(p)
    p = r[0]
    char = r[1]
  }

  assert(char === 'd')
  assert(p.pos === 11)
  assert(p.row === 2)
  assert(p.col === 5)

  ;[p, char] = getNextChar(p)

  assert(char === undefined)
  assert(p.pos === 12)
  assert(p.row === 2)
  assert(p.col === 6)
})
