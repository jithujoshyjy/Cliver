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

    let expression: Expression | MismatchToken = null!

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    groupExpression.start = currentToken.start
    groupExpression.end = currentToken.end
    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parseValue = () => {

        if (skipables.includes(currentToken.type))
            currentToken = skip(parenTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(groupExpression, parenTokens)
        currentToken = parenTokens.currentToken

        return value
    }

    expression = parseValue()
    currentToken = parenTokens.currentToken

    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    if (currentToken.type != TokenType.EOF) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const { value } = expression
    groupExpression.value = value

    return groupExpression
}