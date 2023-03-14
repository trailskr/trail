export const isWhiteSpace = (char: char): bool => {
    return char === ' '
}

export const inRange = (char: char, from: char, to: char): bool => {
    return char >= from && char <= to
}

