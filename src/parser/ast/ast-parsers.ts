import { AstNodeType } from './ast'
import { AstParser } from './ast-parser'

const binaryOperator = AstParser.new(
    (from, to) => ({ type: AstNodeType.BinaryOperator }),
    SearchRepeat.new(SearchStr.new(Str.from('    ')), Slice.new(ok(1), no()))
)