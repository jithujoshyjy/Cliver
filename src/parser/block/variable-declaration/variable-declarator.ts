import { TokenStream } from "../../../lexer/token.js"
import { generateExpression } from "../../inline/expression/expression.js"
import { generatePattern } from "../../inline/expression/pattern/pattern.js"
import { generateTypeExpression } from "../../inline/type/type-expression.js"
import { isOperator, skip, skipables, type Node } from "../../utility.js"

export function generateVariableDeclarator(context: Node, tokens: TokenStream): VariableDeclarator | MismatchToken {
    const variableDeclarator: VariableDeclarator = {
        type: "VariableDeclarator",
        left: null!,
        right: null,
        signature: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const pattern = generatePattern(variableDeclarator, tokens)
    if (pattern.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return pattern
    }

    variableDeclarator.left = pattern
    
    let prevCursor = tokens.cursor
    currentToken = skip(tokens, skipables) // :: | =

    if(isOperator(currentToken, "::")) {
        currentToken = skip(tokens, skipables) // skip ::
        const typeExpr = generateTypeExpression(variableDeclarator, tokens)

        if (typeExpr.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return typeExpr
        }

        variableDeclarator.signature = typeExpr

        prevCursor = tokens.cursor
        currentToken = skip(tokens, skipables) // =
    }
    
    if(isOperator(currentToken, "=")) {

        currentToken = skip(tokens, skipables) // skip =
        const expression = generateExpression(variableDeclarator, tokens)

        if (expression.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return expression
        }

        variableDeclarator.right = expression
    }
    else
        tokens.cursor = prevCursor

    return variableDeclarator
}