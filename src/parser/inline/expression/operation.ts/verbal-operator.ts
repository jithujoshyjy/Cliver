import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, operatorPrecedence, type Node } from "../../../utility.js"

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

    const isOpKeword = (op: typeof currentToken) => {
        return op.type == TokenType.Keyword &&
            (
                op.value as string in operatorPrecedence.infix.left
                || op.value as string in operatorPrecedence.infix.right
                || op.value as string in operatorPrecedence.prefix
            )
    }

    if(!isOpKeword(currentToken)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    verbalOperator.name = currentToken.value as VerbalOperatorKind
    verbalOperator.start = currentToken.start
    verbalOperator.end = currentToken.end

    return verbalOperator
}