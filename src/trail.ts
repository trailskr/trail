import { TokenStream } from './parser/token-stream'
import { Str } from './str'
import { assertInc, unittest } from './unittest'

unittest(Str.from('sample test'), () => {
    const ts = TokenStream.new('a = a + 1')
    unittest(Str.from('sample test 2'), () => {
        assertInc((logger) => {
            logger.log(Str.from('hello'))
            return [{a: 1, b: 2}, {a: 3}]
        })
    })
})
