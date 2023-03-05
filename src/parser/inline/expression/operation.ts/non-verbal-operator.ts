import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, isRightAssociative, type Node } from "../../../utility.js"

export function generateNonVerbalOperator(context: string[], tokens: TokenStream): NonVerbalOperator | MismatchToken {
    const nonVerbalOperator: NonVerbalOperator = {
        type: "NonVerbalOperator",
        precedence: 10,
        kind: "infix",
        name: "",
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const excludedOperators: string[] = [
        "``", ".``", "??", "..", ".", "->", "@", "@@", ":",
    ]
    
    if(currentToken.type != "Operator" || excludedOperators.includes(currentToken.value)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    nonVerbalOperator.name = currentToken.value
    nonVerbalOperator.start = currentToken.start
    nonVerbalOperator.end = currentToken.end

    nonVerbalOperator.line = currentToken.line
    nonVerbalOperator.column = currentToken.column

    tokens.advance()
    return nonVerbalOperator
}

export function printNonVerbalOperator(token: NonVerbalOperator, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return `${token.kind}${token.kind == "infix" ? isRightAssociative(token) ? 'r' : 'l' : ''}__${token.precedence}__(${token.name})`
}