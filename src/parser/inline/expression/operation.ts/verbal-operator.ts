import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateVerbalOperator(context: Node, tokens: TokenStream): VerbalOperator | MismatchToken {
    const verbalOperator: VerbalOperator = {
        type: "VerbalOperator",
        kind: "infix",
        precedence: 10,
        name: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(![TokenType.Keyword, TokenType.Identifier].includes(currentToken.type)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    verbalOperator.name = currentToken.value as VerbalOperatorKind

    return verbalOperator
}