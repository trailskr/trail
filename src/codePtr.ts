export class CodePtr {
    constructor (
        public readonly pos: usize = 0,
        public readonly col: usize = 1,
        public readonly row: usize = 1
    ) {}

    nextCol(): CodePtr {
        const { pos, col, row } = this
        return new CodePtr(pos + 1, col + 1, row)
    }

    nextRow(): CodePtr {
        const { pos, col, row } = this
        return new CodePtr(pos + 1, col, row + 1)
    }

    next(isNewLine: bool): CodePtr {
        return isNewLine ? this.nextRow() : this.nextCol()
    }
}
