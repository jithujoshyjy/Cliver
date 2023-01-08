import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, _skipables, type Node } from "../../utility.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateCaseExpr } from "./case-expression.js"
import { generateExpression } from "./expression.js"

export function generateAsExpression(context: Node, tokens: TokenStream): AsExpression | MismatchToken {
    const asExpression: AsExpression = {
        type: "AsExpression",
        left: null!,
        right: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    const left = generateExpression(asExpression, tokens)

    if (left.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return left
    }

    asExpression.left = left
    currentToken = skip(tokens, _skipables)

    if (!isKeyword(currentToken, "as")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip as
    let right: Identifier | CaseExpr | MismatchToken = null!

    if (isKeyword(currentToken, "case"))
        right = generateCaseExpr(asExpression, tokens)
    else
        right = generateIdentifier(asExpression, tokens)

    if (right.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return right
    }

    asExpression.right = right

    return asExpression
}