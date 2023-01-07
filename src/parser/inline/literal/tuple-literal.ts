import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
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

    /* if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    tupleLiteral.start = currentToken.start
    tupleLiteral.end = currentToken.end

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = parenTokens.currentToken

    const captureComma = () => {
        currentToken = parenTokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const parseValue = () => {

        if (skipables.includes(currentToken.type) || isPunctuator(currentToken, ","))
            currentToken = skip(parenTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(tupleLiteral, parenTokens)
        currentToken = parenTokens.currentToken

        return value
    }

    let hasTrailingComma = false
    while (!parenTokens.isFinished) {
        const value = parseValue()

        if (value.type == "MismatchToken" && value.value.type == TokenType.EOF) {
            hasTrailingComma = true
            break
        }

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        tupleLiteral.values.push(value)
        if (skipables.includes(currentToken.type))
            currentToken = skip(parenTokens, skipables)

        if (currentToken.type == TokenType.EOF)
            break

        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }

        currentToken = parenTokens.currentToken
    }

    if (tupleLiteral.values.length < 1) {
        tokens.cursor = initialCursor
        const error = `A tuple cannot be empty on ${currentToken.line}:${currentToken.column}`
        return createMismatchToken(currentToken, error)
    }
    else if (tupleLiteral.values.length == 1 && context.type != "TypeConstraint" && !hasTrailingComma) {
        const [{ value }] = tupleLiteral.values
        groupExpr.value = value
        return groupExpr
    } */
    return createMismatchToken(currentToken)
    return tupleLiteral
}