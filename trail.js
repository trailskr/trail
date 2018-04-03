const code =
`
a: 1
b: a + 1
out(b)
`

const WS = /^[\s]$/
const LE = /^\n|\r\n$/
const IDENTIFIER = /^[A-Za-z_$][0-9A-Za-z_$]$/
const INTEGER = /^-?[1-9][0-9]?$/g
let pos = 0
class parser {
  pattern = []
  parse(code) {
    for (p of this.pattern) {
      p.lastIndex = pos
      const result = numberRe.exec(str)
      if (result == null) return undefined
      pos = p.lastIndex
    }
  }
}
class pModule {
  parse(code) {
    return {
      imports: [],
      exports: [],
      trails: []
    }
  }
  test(code) {
    return i === 0
  }
}

const pImport = {
  pattern: [/import/, WS, IDENTIFIER, WS, /from/],
  parse: code => {
    return {

    }
  },
  test: code => {
    next('import')
  }
}

console.log(pModule.parse(code))
