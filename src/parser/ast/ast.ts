import { Str } from "src/str"

export enum AstNodeType {
    BinaryOperator = 'BinaryOperator',
    DotAccess = 'DotAccess',
    IndexAccess = 'IndexAccess',
    FunctionCall = 'FunctionCall',
    PrefixOperator = 'PrefixOperator',
    Assignment = 'Assignment',
    Literal = 'Literal',
    Identifier = 'Identifier',

    Error = 'Error',
}

export enum BinaryOperatorType {
    Concat = 'Concat',
    Mul = 'Mul',
    Div = 'Div',
    Plus = 'Plus',
    Minus = 'Minus',
    Equal = 'Equal',
    NotEqual = 'NotEqual',
    LessThanOrEqual = 'LessThanOrEqual',
    GreaterThanOrEqual = 'GreaterThanOrEqual',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',
    And = 'And',
    Or = 'Or',
}

export interface BinaryOperator { type: AstNodeType.BinaryOperator }
export interface DotAccess { type: AstNodeType.DotAccess }
export interface IndexAccess { type: AstNodeType.IndexAccess }
export interface FunctionCall { type: AstNodeType.FunctionCall }

export enum PrefixOperatorType {
    Minus = 'Minus',
    Plus = 'Plus',
    Not = 'Not',
}

export interface PrefixOperator { type: AstNodeType.PrefixOperator, operator: PrefixOperatorType, operand: AstNode }
export interface Assignment { type: AstNodeType.Assignment }
export interface Literal { type: AstNodeType.Literal }
export interface Identifier { type: AstNodeType.Identifier, name: Str }

export type AstNode = 
    BinaryOperator |
    DotAccess |
    IndexAccess |
    FunctionCall |
    PrefixOperator |
    Assignment |
    Literal |
    Identifier

        
export interface AstNodeError {
    type: AstNodeType.Error
    msg: Str
}
        
export type AstNodeResult = AstNode | AstNodeError