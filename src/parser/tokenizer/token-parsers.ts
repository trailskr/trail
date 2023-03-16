import { no, ok } from "src/opt"
import { Slice } from "src/slice"
import { Str } from "src/str"
import { assertEq, unittest } from "src/unittest"
import { Vec } from "src/vec"
import { CodePtr } from "./code-ptr"
import { SearchChar } from "./searchers/search-char"
import { SearchRepeat } from "./searchers/search-repeat"
import { SearchSequence, SequenceFlag } from "./searchers/search-sequence"
import { SearchStr } from "./searchers/search-str"
import { TokenParser } from "./token-parser"
import { TokenType } from "./tokens"

export const indent = TokenParser.new(
    (oldCodePtr, newCodePtr) => ({ type: TokenType.Indent, size: newCodePtr.lenFrom(oldCodePtr) / 4 }),
    SearchRepeat.new(SearchStr.new(Str.from('    ')), Slice.new(no(), no()))
)
export const lineEnd = TokenParser.new(
    () => ({ type: TokenType.LineEnd }),
    SearchSequence.new(Vec.from([
        { searcher: SearchChar.new('\r'), flag: SequenceFlag.Optional },
        { searcher: SearchChar.new('\n'), flag: SequenceFlag.None },
    ]))
)

export const arrow = TokenParser.new(() => ({ type: TokenType.Arrow }), SearchStr.new(Str.from('=>')))

export const plus = TokenParser.new(() => ({ type: TokenType.Plus }), SearchChar.new('+'))
export const minus = TokenParser.new(() => ({ type: TokenType.Minus }), SearchChar.new('-'))
export const mul = TokenParser.new(() => ({ type: TokenType.Mul }), SearchChar.new('*'))
export const div = TokenParser.new(() => ({ type: TokenType.Div }), SearchChar.new('/'))

unittest(Str.from('token parsers'), () => {
    const [newCodePtr, result] = indent.parse(CodePtr.new(Str.from('          ')))
    assertEq(() => [newCodePtr.pos(), 8])
    assertEq(() => [result, ok({ type: TokenType.Indent, size: 2 })])
})
