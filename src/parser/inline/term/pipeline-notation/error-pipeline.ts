import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../../utility.js"

export function generateErrorPipeline(context: Node, tokens: TokenStream): ErrorPipeline | MismatchToken {
    const errorPipeline: ErrorPipeline = {
        type: "ErrorPipeline",
        expression: null!,
        handler: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const isErrorPipe = isOperator(currentToken, "??")
    if (!isErrorPipe) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip ??

    return errorPipeline
}