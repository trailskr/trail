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

export const represent = (expr, needParens = false) => {
  switch (expr.type) {
    case 'block':
      return expr.expressions.map(represent).join('\n')
    case 'assignment':
      return `${expr.identifiers.map(represent).join(', ')} = ${expr.values.map(represent).join(', ')}`
    case 'functionCall':
      return `${represent(expr.identifier)}(${expr.args.map(represent).join(', ')})`
    case 'parensExpression':
      return `(${represent(expr.content)})`
    case 'binaryOperator':
      return needParens
        ? `(${represent(expr.left, true)} ${expr.op} ${represent(expr.right, true)})`
        : `${represent(expr.left, true)} ${expr.op} ${represent(expr.right, true)}`
    case 'prefixOperator':
      return needParens
        ? expr.op.length === 1
          ? `(${expr.op}${represent(expr.right, true)})`
          : `(${expr.op} ${represent(expr.right, true)})`
        : expr.op.length === 1
          ? `${expr.op}${represent(expr.right, true)}`
          : `${expr.op} ${represent(expr.right, true)}`
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
