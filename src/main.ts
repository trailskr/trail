import { assert, Str, unittest } from './lib'

console.log('hello from main.ts')

unittest(Str.new('some basic tests'), () => {
    const a = 5
    assert(() => a === 4)
})
