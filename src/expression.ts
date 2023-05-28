import { CodePtr } from './codePtr'

export abstract class Expression {
    constructor(
        public readonly from: CodePtr,
        public readonly to: CodePtr
    ) {}

    eval(): f64 {
        throw new Error('abstract method calls')
    }
}

export enum BinaryOperatorType {
    Mul = 'Mul',
    Div = 'Div',
    Add = 'Add',
    Sub = 'Sub'
}

export class BinaryOperatorExpression extends Expression {
    public readonly operator: BinaryOperatorType
    public readonly left: Expression
    public readonly right: Expression

    constructor(
        from: CodePtr,
        to: CodePtr,
        operator: BinaryOperatorType,
        left: Expression,
        right: Expression
    ) {
        super(from, to)
        this.operator = operator
        this.left = left
        this.right = right
    }

    eval(): f64 {
        const [l, r] = [this.left.eval(), this.right.eval()]
        switch (this.operator) {
            case BinaryOperatorType.Add: return l + r
            case BinaryOperatorType.Sub: return l - r
            case BinaryOperatorType.Mul: return l * r
            default: return l / r
        }
    }
}

export enum UnaryOperatorType {
    Plus = 'Plus',
    Minus = 'Minus',
}

export class UnaryOperatorExpression extends Expression {
    public readonly operator: UnaryOperatorType
    public readonly right: Expression

    constructor(
        public readonly from: CodePtr,
        public readonly to: CodePtr,
        operator: UnaryOperatorType,
        right: Expression
    ) {
        super(from, to)
        this.operator = operator
        this.right = right
    }

    eval(): f64 {
        const l = this.right.eval()
        return this.operator === UnaryOperatorType.Minus ? -l : l
    }
}

export class DecimalIntegerNumberExpression extends Expression {
    public readonly value: bigint

    constructor(
        from: CodePtr,
        to: CodePtr,
        value: bigint
    ) {
        super(from, to)
        this.value = value
    }

    eval(): f64 {
        return Number(this.value)
    }
}
