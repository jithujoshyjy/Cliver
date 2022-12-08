import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"

export function generateArrayLiteral(context: Node, tokens: TokenStream): ArrayLiteral | MismatchToken {
    const arrayLiteral: ArrayLiteral = {
        type: "ArrayLiteral",
        values: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(currentToken.type != TokenType.BracketEnclosed) {
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

    const bracketTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parseValue = () => {
        currentToken = bracketTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(bracketTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(arrayLiteral, tokens)

        return value
    }

    while (!bracketTokens.isFinished) {
        const value = parseValue()

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        arrayLiteral.values.push(value)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    return arrayLiteral
}