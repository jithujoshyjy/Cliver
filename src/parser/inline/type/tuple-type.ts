import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateTupleType(context: Node, tokens: TokenStream): TupleType | GroupTypeExpression | MismatchToken {

    const tupleType: TupleType = {
        type: "TupleType",
        values: [],
        start: 0,
        end: 0
    }

    const groupTypeExpr: GroupTypeExpression = {
        type: "GroupTypeExpression",
        body: null!,
        constraint: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    /* if (currentToken.type != TokenType.ParenEnclosed) {
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

        let value: TypeExpression | MismatchToken = generateTypeExpression(tupleType, parenTokens)

        return value
    }

    while (!parenTokens.isFinished) {
        const value = parseValue()

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        tupleType.values.push(value)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    if (!["FunctionCallType", "FunctionType"].includes(context.type))
        if (tupleType.values.length < 1) {
            tokens.cursor = initialCursor
            const error = `A tuple cannot be empty on ${currentToken.line}:${currentToken.column}`
            return createMismatchToken(currentToken, error)
        }
        else if (tupleType.values.length == 1) {
            const [{ body, constraint }] = tupleType.values

            groupTypeExpr.body = body
            groupTypeExpr.constraint = constraint

            return groupTypeExpr
        } */

    return tupleType
}