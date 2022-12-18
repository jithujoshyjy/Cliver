import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, type Node } from "../../../utility.js"

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

    const excludedOperators: string[] = [
        "``", ".``", "??", "..", ".", "?.", "?", "..?", "->", "@", "@@", ":",
    ]

    const isExcludedOperator = (y: any) => excludedOperators.some(x => isOperator(y, x))
    
    if(currentToken.type != TokenType.Operator || isExcludedOperator(currentToken)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    nonVerbalOperator.name = currentToken.value as string
    nonVerbalOperator.start = currentToken.start
    nonVerbalOperator.end = currentToken.end

    return nonVerbalOperator
}