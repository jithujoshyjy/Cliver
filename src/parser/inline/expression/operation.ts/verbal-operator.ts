import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, operatorPrecedence, type Node, isKeyword } from "../../../utility.js"

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

    const excludedOperators: string[] = [
        "as"
    ]

    const isExcludedOperator = (y: any) => excludedOperators.some(x => isKeyword(y, x as KeywordKind))

    const isOpKeword = (op: typeof currentToken) => {
        return op.type == TokenType.Keyword &&
            (
                op.value as string in operatorPrecedence.infix.left
                || op.value as string in operatorPrecedence.infix.right
                || op.value as string in operatorPrecedence.prefix
            )
    }

    if(!isOpKeword(currentToken) || isExcludedOperator(currentToken)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    verbalOperator.name = currentToken.value as VerbalOperatorKind
    verbalOperator.start = currentToken.start
    verbalOperator.end = currentToken.end

    return verbalOperator
}