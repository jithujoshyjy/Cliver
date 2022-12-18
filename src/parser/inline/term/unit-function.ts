import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node, isPunctuator } from "../../utility.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generateExpression } from "../expression/expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateTypeAssertion } from "../type/type-assertion.js"
import { generateIdentifier } from "../literal/identifier.js"

export function generateUnitFunction(context: Node, tokens: TokenStream): UnitFunction | MismatchToken {
    const unitFunction: UnitFunction = {
        type: "UnitFunction",
        params: [],
        signature: null,
        body: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (currentToken.type == TokenType.ParenEnclosed) {

        const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
        currentToken = parenTokens.currentToken

        const parseParam = () => {

            if (skipables.includes(currentToken.type) || isPunctuator(currentToken, ","))
                currentToken = skip(parenTokens, skipables)

            let param: AssignExpr | Pattern | MismatchToken = generateAssignExpr(unitFunction, parenTokens)

            if (param.type == "MismatchToken")
                param = generatePattern(unitFunction, parenTokens)

            return param
        }

        const captureComma = () => {
            currentToken = skip(parenTokens, skipables)

            if (!isPunctuator(currentToken, ","))
                return createMismatchToken(currentToken)

            return currentToken
        }

        while (!parenTokens.isFinished) {

            if (parenTokens.currentToken.type == TokenType.EOF)
                break

            const param = parseParam()

            if (param.type == "MismatchToken" && param.value.type == TokenType.EOF)
                break

            if (param.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return param
            }

            unitFunction.params.push(param)
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
    }
    else if (currentToken.type == TokenType.Identifier) {

        let identifier: Identifier
            | MismatchToken = generateIdentifier(unitFunction, tokens)

        if (identifier.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return identifier
        }

        const literal: Literal = {
            type: "Literal",
            value: identifier,
            start: 0,
            end: 0
        }

        const _pattern: Pattern = {
            type: "Pattern",
            body: literal,
            start: 0,
            end: 0,
        }

        unitFunction.params.push(_pattern)
    }
    else {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }
    
    currentToken = skip(tokens, _skipables) // ->

    if (!isOperator(currentToken, "->")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip ->

    const body = generateExpression(unitFunction, tokens)
    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    unitFunction.body = body

    return unitFunction
}