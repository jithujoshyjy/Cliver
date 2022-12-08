import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"

export function generateForInline(context: Node, tokens: TokenStream): ForInline | MismatchToken {
    const forInline: ForInline = {
        type: "ForInline",
        body: null!,
        condition: null!,
        start: 0,
        end: 0
    }

    let  currrentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(!isKeyword(currrentToken, "for")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currrentToken)
    }

    currrentToken = skip(tokens, skipables) // skip for
    const condition = generateExpression(forInline, tokens)

    if(condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    forInline.condition = condition
    currrentToken = skip(tokens, skipables) // :

    if(!isOperator(currrentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currrentToken)
    }

    currrentToken = skip(tokens, skipables) // skip :
    const body = generateExpression(forInline, tokens)

    if(body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    forInline.body = body

    return forInline
}