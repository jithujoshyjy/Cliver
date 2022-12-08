import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"

export function generateTupleLiteral(context: Node, tokens: TokenStream): TupleLiteral | GroupExpression | MismatchToken {
    const tupleLiteral: TupleLiteral = {
        type: "TupleLiteral",
        values: [],
        start: 0,
        end: 0
    }

    const groupExpr: GroupExpression = {
        type: "GroupExpression",
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parseValue = () => {
        currentToken = parenTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(parenTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(tupleLiteral, parenTokens)

        return value
    }

    while (!parenTokens.isFinished) {
        const value = parseValue()

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        tupleLiteral.values.push(value)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    if (tupleLiteral.values.length < 1) {
        tokens.cursor = initialCursor
        const error = `A tuple cannot be empty on ${currentToken.line}:${currentToken.column}`
        return createMismatchToken(currentToken, error)
    }
    else if (tupleLiteral.values.length == 1 && context.type != "TypeConstraint") {
        const [{ value }] = tupleLiteral.values
        groupExpr.value = value
        return groupExpr
    }

    return tupleLiteral
}