import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, _skipables, type Node, PartialParse } from "../../utility.js"
import { generateKeyword } from "../keyword.js"
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
    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const asKeyword = generateKeyword(asExpression, tokens)
    if (asKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return asKeyword
    }

    if (!isKeyword(asKeyword, "as")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken
    
    let right: Identifier
        | CaseExpr
        | MismatchToken = null!

    right = generateIdentifier(asExpression, tokens)

    if (right.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return right
    }

    asExpression.right = right
    return asExpression
}