import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
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

    if (currentToken.type != TokenType.BracketEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    arrayLiteral.start = currentToken.start
    arrayLiteral.end = currentToken.end

    const bracketTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = bracketTokens.currentToken

    const captureComma = () => {
        currentToken = bracketTokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const parseValue = () => {

        if (skipables.includes(currentToken.type) || isPunctuator(currentToken, ","))
            currentToken = skip(bracketTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(arrayLiteral, bracketTokens)
        currentToken = bracketTokens.currentToken

        return value
    }

    while (!bracketTokens.isFinished) {

        if (bracketTokens.currentToken.type == TokenType.EOF)
            break
        
        const value = parseValue()

        if (value.type == "MismatchToken" && value.value.type == TokenType.EOF)
            break

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        arrayLiteral.values.push(value)
        if (skipables.includes(currentToken.type))
            currentToken = skip(bracketTokens, skipables)
        
        if (currentToken.type == TokenType.EOF)
            break

        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }

        currentToken = bracketTokens.currentToken
    }

    return arrayLiteral
}