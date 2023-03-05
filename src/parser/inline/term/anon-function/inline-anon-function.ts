import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../../../utility.js"
import { generateAssignExpr } from "../../expression/assign-expression.js"
import { generateExpression } from "../../expression/expression.js"
import { generatePattern } from "../../expression/pattern/pattern.js"
import { generateTypeExpression } from "../../type/type-expression.js"

export function generateInlineAnonFunction(context: string[], tokens: TokenStream): InlineAnonFunction | MismatchToken {
    const inlineAnonFunction: InlineAnonFunction = {
        type: "InlineAnonFunction",
        body: null!,
        params: [],
        signature: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables) // skip fun
    const initialCursor = tokens.cursor

    /* const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(inlineAnonFunction, tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if (signature.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return signature
        }
        inlineAnonFunction.signature = signature
        currentToken = skip(tokens, skipables)
    }

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parseParam = () => {
        currentToken = parenTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(parenTokens, skipables)

        let param: AssignExpr | Pattern | MismatchToken = generateAssignExpr(inlineAnonFunction, parenTokens)

        if (param.type == "MismatchToken")
            param = generatePattern(inlineAnonFunction, parenTokens)

        return param
    }

    while (!parenTokens.isFinished) {
        const param = parseParam()

        if (param.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return param
        }

        inlineAnonFunction.params.push(param)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    currentToken = tokens.currentToken // :

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :

    const expression = generateExpression(inlineAnonFunction, tokens)
    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    inlineAnonFunction.body = expression */

    return inlineAnonFunction
}