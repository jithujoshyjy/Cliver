import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, isPunctuator, skip, _skipables, type Node, skipables, isOperator } from "../../utility.js"
import { generateAsExpression } from "../expression/as-expression.js"
import { generateExpression } from "../expression/expression.js"
import { generateKeyword } from "../keyword.js"

export function generateIfInline(context: Node, tokens: TokenStream): IfInline | MismatchToken {
    const ifInline: IfInline = {
        type: "IfInline",
        body: null!,
        condition: null!,
        fallback: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const ifKeyword = generateKeyword(ifInline, tokens)

    if (ifKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return ifKeyword
    }

    if (!isKeyword(ifKeyword, "if")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    ifInline.start = ifKeyword.start
    ifInline.line = ifKeyword.line
    ifInline.column = ifKeyword.column

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const conditionGenerators = [generateAsExpression, generateExpression]

    let condition: AsExpression
        | Expression
        | MismatchToken = null!

    for (const conditionGenerator of conditionGenerators) {
        condition = conditionGenerator(ifInline, tokens)
        currentToken = tokens.currentToken

        if (condition.type != "MismatchToken")
            break

        if (condition.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return condition
        }
    }

    if (condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    ifInline.condition = condition
    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken
    
    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const body = generateExpression(ifInline, tokens)
    
    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    ifInline.body = body

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const elseKeyword = generateKeyword(ifInline, tokens)
    
    if (elseKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return elseKeyword
    }

    if (!isKeyword(elseKeyword, "else")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const fallback = generateExpression(ifInline, tokens)
    
    if (fallback.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return fallback
    }

    ifInline.end = fallback.end
    ifInline.fallback = fallback

    return ifInline
}