import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, isPunctuator, skip, _skipables, type Node } from "../../../utility.js"
import { generateAsExpression } from "../../expression/as-expression.js"
import { generateExpression } from "../../expression/expression.js"
import { generateElseInline } from "./else-inline.js"

export function generateIfInline(context: Node, tokens: TokenStream): IfInline | MismatchToken {
    const ifInline: IfInline = {
        type: "IfInline",
        alternate: null!,
        body: null!,
        condition: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // if
    const initialCursor = tokens.cursor

    if(!isKeyword(currentToken, "if")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip if

    let condition: AsExpression | Expression | MismatchToken = generateExpression(ifInline, tokens)

    if (condition.type == "MismatchToken")
        condition = generateAsExpression(ifInline, tokens)

    if (condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    ifInline.condition = condition
    currentToken = skip(tokens, _skipables) // :

    if(!isPunctuator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip :
    const body = generateExpression(ifInline, tokens)

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    ifInline.body = body
    currentToken = skip(tokens, _skipables) // else

    if(!isKeyword(currentToken, "else")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const alternate = generateElseInline(ifInline, tokens)
    if (alternate.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return alternate
    }

    ifInline.alternate = alternate

    return ifInline
}