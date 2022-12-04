import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility"

export function generateNonVerbalOperator(context: Node, tokens: TokenStream): NonVerbalOperator | MismatchToken {
    const nonVerbalOperator: NonVerbalOperator = {
        type: "NonVerbalOperator",
        precedence: 10,
        kind: "infix",
        name: "",
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(currentToken.type !== TokenType.Operator) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    nonVerbalOperator.name = currentToken.value as string

    return nonVerbalOperator
}