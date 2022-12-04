import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node } from "../../utility"
import { generateExpression } from "../expression/expression.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateTypeAssertion(context: Node, tokens: TokenStream): TypeAssertion | MismatchToken {
    const typeAssertion: TypeAssertion = {
        type: "TypeAssertion",
        left: null!,
        right: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const expression = generateExpression(typeAssertion, tokens)
    if(expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    typeAssertion.left = expression

    currentToken = skip(tokens, skipables) // ::
    if(currentToken.value != "::") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip ::
    const typeExpr = generateTypeExpression(typeAssertion, tokens)

    if(typeExpr.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeExpr
    }

    typeAssertion.right = typeExpr

    return typeAssertion
}

