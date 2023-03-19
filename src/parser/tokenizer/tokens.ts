import { Str } from 'src/str'
import { CodePtr } from './code-ptr'

export enum TokenType {
    Indent = 'Indent',
    LineEnd = 'LineEnd',

    Arrow = 'Arrow',

    Equal = 'Equal',
    NotEqual = 'NotEqual',
    LessThanOrEqual = 'LessThanOrEqual',
    GreaterThanOrEqual = 'GreaterThanOrEqual',
    LessThan = 'LessThan',
    GreaterThan = 'GreaterThan',

    Assign = 'Assign',

    Plus = 'Plus',
    Minus = 'Minus',
    Mul = 'Mul',
    Div = 'Div',
    Concat = 'Concat',
    Or = 'Or',
    And = 'And',

    Dot = 'Dot',
    ExclamationMark = 'ExclamationMark',
    QuestionMark = 'QuestionMark',
    Colon = 'Colon',
    At = 'At',
    Sharp = 'Sharp',
    
    Ampersand = 'Ampersand',
    VerticalBar = 'VerticalBar',
    LeftParenthesis = 'LeftParenthesis',
    RightParenthesis = 'RightParenthesis',
    LeftSquareBracket = 'LeftSquareBracket',
    RightSquareBracket = 'RightSquareBracket',
    LeftCurlyBrace = 'LeftCurlyBrace',
    RightCurlyBrace = 'RightCurlyBrace',

    True = 'True',
    False = 'False',
    
    Identifier = 'Identifier',
    DecimalIntegerNumber = 'DecimalIntegerNumber',
    DecimalFractionalNumber = 'DecimalFractionalNumber',
    StringSingleQuote = 'StringSingleQuote',
    StringDoubleQuote = 'StringDoubleQuote',

    Error = 'Error',
}

export interface Indent { type: TokenType.Indent, size: usize }
export interface LineEnd { type: TokenType.LineEnd }

export interface Arrow { type: TokenType.Arrow }

export interface Equal { type: TokenType.Equal }
export interface NotEqual { type: TokenType.NotEqual }
export interface LessThanOrEqual { type: TokenType.LessThanOrEqual }
export interface GreaterThanOrEqual { type: TokenType.GreaterThanOrEqual }
export interface LessThan { type: TokenType.LessThan }
export interface GreaterThan { type: TokenType.GreaterThan }

export interface Assign { type: TokenType.Assign }

export interface Plus { type: TokenType.Plus }
export interface Minus { type: TokenType.Minus }
export interface Mul { type: TokenType.Mul }
export interface Div { type: TokenType.Div }
export interface Concat { type: TokenType.Concat }
export interface Or { type: TokenType.Or }
export interface And { type: TokenType.And }

export interface Dot { type: TokenType.Dot }
export interface ExclamationMark { type: TokenType.ExclamationMark }
export interface QuestionMark { type: TokenType.QuestionMark }
export interface Colon { type: TokenType.Colon }
export interface At { type: TokenType.At }
export interface Sharp { type: TokenType.Sharp }

export interface Ampersand { type: TokenType.Ampersand }
export interface VerticalBar { type: TokenType.VerticalBar }
export interface LeftParenthesis { type: TokenType.LeftParenthesis }
export interface RightParenthesis { type: TokenType.RightParenthesis }
export interface LeftSquareBracket { type: TokenType.LeftSquareBracket }
export interface RightSquareBracket { type: TokenType.RightSquareBracket }
export interface LeftCurlyBrace { type: TokenType.LeftCurlyBrace }
export interface RightCurlyBrace { type: TokenType.RightCurlyBrace }

export interface True { type: TokenType.True }
export interface False { type: TokenType.False }

export interface Identifier { type: TokenType.Identifier, name: Str }
export interface DecimalIntegerNumber { type: TokenType.DecimalIntegerNumber, value: i64 }
export interface DecimalFractionalNumber { type: TokenType.DecimalFractionalNumber, value: f64 }
export interface StringSingleQuote { type: TokenType.StringSingleQuote, text: Str }
export interface StringDoubleQuote { type: TokenType.StringDoubleQuote, text: Str }

export type Token = ({ from: CodePtr, to: CodePtr }) & (
    Indent |
    LineEnd |

    Arrow |

    Equal |
    NotEqual |
    LessThanOrEqual |
    GreaterThanOrEqual |
    LessThan |
    GreaterThan |

    Assign |

    Plus |
    Minus |
    Mul |
    Div |
    Concat |
    Or |
    And |

    Dot |
    ExclamationMark |
    QuestionMark |
    Colon |
    At |
    Sharp |

    Ampersand |
    VerticalBar |
    LeftParenthesis |
    RightParenthesis |
    LeftSquareBracket |
    RightSquareBracket |
    LeftCurlyBrace |
    RightCurlyBrace |

    True |
    False |

    Identifier |
    DecimalIntegerNumber |
    DecimalFractionalNumber |
    StringSingleQuote |
    StringDoubleQuote
)

export interface TokenError {
    type: TokenType.Error
    msg: Str
}

export type TokenResult = Token | TokenError
