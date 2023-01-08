import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../../utility.js"

export function generateTransformPipeline(context: Node, tokens: TokenStream): TransformPipeline | MismatchToken {
    const transformPipeline: TransformPipeline = {
        type: "TransformPipeline",
        expression: null!,
        transformer: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const isTransformPipe = isOperator(currentToken, "``") || isOperator(currentToken, ".``")
    if (!isTransformPipe) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip `` | .``
    


    return transformPipeline
}