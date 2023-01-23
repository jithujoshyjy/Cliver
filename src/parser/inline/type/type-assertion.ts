import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node, isOperator } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"
import { generateNonVerbalOperator } from "../expression/operation.ts/non-verbal-operator.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateTypeAssertion(context: Node, tokens: TokenStream): TypeAssertion | MismatchToken {
    const typeAssertion: TypeAssertion = {
        type: "TypeAssertion",
        left: null!,
        right: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const expression = generateExpression(typeAssertion, tokens)
    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    typeAssertion.left = expression

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const doubleColon = generateNonVerbalOperator(typeAssertion, tokens)

    if (doubleColon.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return doubleColon
    }

    if(doubleColon.name != "::") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken
    
    const typeExpr = generateTypeExpression(typeAssertion, tokens)

    if (typeExpr.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeExpr
    }

    typeAssertion.right = typeExpr

    return typeAssertion
}

