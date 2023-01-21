import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"
import { generateFloatLiteral } from "./float-literal.js"

export function generateNumericLiteral(context: Node, tokens: TokenStream): NumericLiteral | MismatchToken {
    const numericLiteral: NumericLiteral = {
        type: "NumericLiteral",
        kind: "float",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let number: IntegerLiteral
        | FloatLiteral
        | MismatchToken = generateFloatLiteral(numericLiteral, tokens)

    if (number.type == "MismatchToken") {
        numericLiteral.kind = "integer"
        number = number.partialParse?.result as IntegerLiteral | null ?? createMismatchToken(currentToken)
    }

    if (number.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return number
    }

    numericLiteral.value = number.value
    numericLiteral.start = number.start

    numericLiteral.line = number.line
    numericLiteral.column = number.column

    numericLiteral.end = number.end
    return numericLiteral
}

export function printNumericLiteral(token: NumericLiteral, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    
    const excl = '!'
    const space = ' '.repeat(4)
    return "NumericLiteral\n" + space.repeat(indent) + endJoiner +
        token.value + excl + token.kind
}