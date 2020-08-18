const stringify = (str) => {
  return "'" + str
    .replace(/[\\\t\n\r\b\f]/g, a => {
      switch (a) {
        case '\\':
          return '\\\\'
        case '\t':
          return '\\t'
        case '\n':
          return '\\n'
        case '\r':
          return '\\r'
        case '\b':
          return '\\b'
        case '\f':
          return '\\f'
      }
    })
    .replace(/'/g, '\\$&') + "'"
}

const str = (val) => {
  return val.toString()
}

export const represent = (expr) => {
  switch (expr.type) {
    case 'assignment':
      return `${represent(expr.identifier)}: ${represent(expr.value)}`
    case 'functionCall':
      return `${represent(expr.identifier)}(${expr.args.map(represent).join(', ')})`
    case 'parensExpression':
      return `(${represent(expr.content)})`
    case 'binaryOperator':
      return `${represent(expr.left)} ${expr.op} ${represent(expr.right)}`
    case 'prefixOperator':
      return expr.op.length === 1
        ? `${expr.op}${represent(expr.right)}`
        : `${expr.op} ${represent(expr.right)}`
    case 'identifier':
      return expr.label
    case 'integer':
    case 'fractional':
      return str(expr.value)
    case 'string':
      return stringify(expr.value)
    case 'boolean':
      return str(expr.value)
    default:
      console.error(`unimplemented representation for type ${expr.type}`)
  }
}
