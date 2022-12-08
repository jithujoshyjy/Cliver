import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node } from "../../utility.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generateExpression } from "../expression/expression.js"
import { generatePattern } from "../expression/pattern.js"
import { generateTypeAssertion } from "../type/type-assertion.js"
import { generateIdentifier } from "./identifier.js"

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

        const parseParam = () => {
            currentToken = parenTokens.currentToken

            if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
                currentToken = skip(parenTokens, skipables)

            let param: AssignExpr | Pattern | MismatchToken = generateAssignExpr(unitFunction, parenTokens)

            if (param.type == "MismatchToken")
                param = generatePattern(unitFunction, parenTokens)

            return param
        }

        const captureComma = () => {
            currentToken = skip(tokens, skipables)
            if (!isOperator(currentToken, ",")) {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }

            return currentToken
        }

        while (!parenTokens.isFinished) {
            const param = parseParam()

            if (param.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return param
            }

            unitFunction.params.push(param)
            const comma = captureComma()

            if (comma.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return comma
            }
        }
    }
    else {

        let pattern: TypeAssertion
            | Identifier
            | MismatchToken = generateTypeAssertion(unitFunction, tokens)

        if (pattern.type == "MismatchToken") {
            pattern = generateIdentifier(unitFunction, tokens)
            currentToken = tokens.currentToken
        }

        if (pattern.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return pattern
        }

        const inline = {
            type: pattern.type == "Identifier" ? "Literal" : "Term",
            value: pattern,
            start: 0,
            end: 0
        }

        const _pattern: Pattern = {
            type: "Pattern",
            body: inline as Literal | Term,
            start: 0,
            end: 0,
        }

        unitFunction.params.push(_pattern)
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