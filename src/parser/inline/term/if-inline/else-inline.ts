import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, _skipables, type Node } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"

export function generateElseInline(context: Node, tokens: TokenStream): ElseInline | MismatchToken {
    const elseInline: ElseInline = {
        type: "ElseInline",
        body: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // else
    const initialCursor = tokens.cursor

    if(!isKeyword(currentToken, "else")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip else
    const body = generateExpression(elseInline, tokens)

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    elseInline.body = body

    return elseInline
}