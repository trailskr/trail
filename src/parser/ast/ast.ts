import { Str } from "src/str"
import { Vec } from "src/vec"
import { CharStream } from "../tokenizer/char-stream"

export enum AstNodeType {
    BinaryOperator = 'BinaryOperator',
    DotAccess = 'DotAccess',
    IndexAccess = 'IndexAccess',
    FunctionCall = 'FunctionCall',
    FunctionDeclaration = 'FunctionDeclaration',
    PrefixOperator = 'PrefixOperator',
    Assignment = 'Assignment',
    BooleanLiteral = 'BooleanLiteral',
    FractionalNumberLiteral = 'FractionalNumberLiteral',
    IntegerNumberLiteral = 'IntegerNumberLiteral',
    StringLiteral = 'StringLiteral',
    CharLiteral = 'CharLiteral',
    Identifier = 'Identifier',
    Structure = 'Structure',
    Enumeration = 'Enumeration',

    Error = 'Error',
}

export enum BinaryOperatorType {
    Concat = 'Concat',
    Mul = 'Mul',
    Div = 'Div',
    Add = 'Add',
    Sub = 'Sub',
    Equal = 'Equal',
    NotEqual = 'NotEqual',
    LessThanOrEqual = 'LessThanOrEqual',
    GreaterThanOrEqual = 'GreaterThanOrEqual',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',
    And = 'And',
    Or = 'Or',
}

export interface BinaryOperator { type: AstNodeType.BinaryOperator, left: AstNode, right: AstNode, operator: BinaryOperatorType }
export interface DotAccess { type: AstNodeType.DotAccess, left: AstNode, right: AstNode }
export interface IndexAccess { type: AstNodeType.IndexAccess, left: AstNode, right: AstNode }
export interface FunctionCall { type: AstNodeType.FunctionCall, name: AstNode, arguments: Vec<AstNode> }

export interface FunctionParameter {
    name: Str,
    type: AstNode,
    defaultValue: AstNode,
}

export interface FunctionDeclaration { type: AstNodeType.FunctionDeclaration, parameters: Vec<FunctionParameter> }

export enum PrefixOperatorType {
    Minus = 'Minus',
    Plus = 'Plus',
    Not = 'Not',
}

export interface PrefixOperator { type: AstNodeType.PrefixOperator, operator: PrefixOperatorType, operand: AstNode }
export interface Assignment { type: AstNodeType.Assignment }
export interface BooleanLiteral { type: AstNodeType.BooleanLiteral, value: bool }
export interface FractionalNumberLiteral { type: AstNodeType.FractionalNumberLiteral, value: f64 }
export interface IntegerNumberLiteral { type: AstNodeType.IntegerNumberLiteral, value: i64 }
export interface StringLiteral { type: AstNodeType.StringLiteral, value: Str }
export interface CharLiteral { type: AstNodeType.CharLiteral, value: char }
export interface Identifier { type: AstNodeType.Identifier, name: Str }

export interface StructureField {
    name: Str,
    type: AstNode,
    isPublic: boolean,
}

export interface Structure { type: AstNodeType.Structure, fields: Vec<StructureField> }
export interface Enumeration { type: AstNodeType.Enumeration, variants: Str }

export type AstNode = ({ from: CharStream, to: CharStream }) & (
    BinaryOperator |
    DotAccess |
    IndexAccess |
    FunctionCall |
    FunctionDeclaration |
    PrefixOperator |
    Assignment |
    BooleanLiteral |
    FractionalNumberLiteral |
    IntegerNumberLiteral |
    StringLiteral |
    CharLiteral |
    Identifier
)

        
export interface AstNodeError {
    type: AstNodeType.Error
    msg: Str
}
        
export type AstNodeResult = AstNode | AstNodeError