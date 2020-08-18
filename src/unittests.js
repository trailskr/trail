export const unittest = (fn) => {
  if (process.env.NODE_ENV === 'test') {
    fn()
  }
}

export const assert = (expression) => {
  if (!expression) {
    throw new Error('assertion failed')
  }
}
