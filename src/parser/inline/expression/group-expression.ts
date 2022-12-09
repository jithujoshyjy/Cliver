import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression } from "./expression.js"

export function generateGroupExpression(context: Node, tokens: TokenStream): GroupExpression | MismatchToken {
    const groupExpression: GroupExpression = {
        type: "GroupExpression",
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let expression: Expression = null!

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parseValue = () => {
        currentToken = parenTokens.currentToken

        if (skipables.includes(currentToken.type))
            currentToken = skip(parenTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(groupExpression, parenTokens)

        return value
    }

    while (!parenTokens.isFinished) {
        const value = parseValue()

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        expression = value
        currentToken = tokens.currentToken
    }

    if (expression === null || !parenTokens.isFinished) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const { value } = expression
    groupExpression.value = value

    return groupExpression
}