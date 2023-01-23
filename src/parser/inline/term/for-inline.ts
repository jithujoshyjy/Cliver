import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"
import { generateKeyword } from "../keyword.js"

export function generateForInline(context: Node, tokens: TokenStream): ForInline | MismatchToken {
    const forInline: ForInline = {
        type: "ForInline",
        body: null!,
        condition: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const forKeyword = generateKeyword(forInline, tokens)

    if (forKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return forKeyword
    }

    if (!isKeyword(forKeyword, "for")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    forInline.start = forKeyword.start
    forInline.line = forKeyword.line
    forInline.column = forKeyword.column

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const condition = generateExpression(forInline, tokens)
    if (condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    forInline.condition = condition
    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const body = generateExpression(forInline, tokens)

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    forInline.body = body
    return forInline
}