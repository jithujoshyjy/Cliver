import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateTypeExpression } from "../type/type-expression.js"

export function generateFunctionPrototype(context: Node, tokens: TokenStream): FunctionPrototype | MismatchToken {
    const functionPrototype: FunctionPrototype = {
        type: "FunctionPrototype",
        kind: ["return"],
        params: [],
        signature: null,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables) // skip fun
    const initialCursor = tokens.cursor

    /* const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(functionPrototype, tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if (signature.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return signature
        }
        functionPrototype.signature = signature
    }

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isPunctuator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const captureFunctionKind = () => {
        currentToken = skip(tokens, skipables)
        const name = generateIdentifier(functionPrototype, tokens)
        return name
    }

    if (isOperator(currentToken, "<"))
        while (!tokens.isFinished) {

            const kind = captureFunctionKind()
            if (kind.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return kind
            }

            functionPrototype.kind.push(kind.name as FunctionKind)

            if (!tokens.isFinished) {
                const comma = captureComma()
                if (comma.type == "MismatchToken" && isOperator(currentToken, ">")) {
                    currentToken = skip(tokens, skipables)
                    break
                }
                
                if (comma.type == "MismatchToken") {
                    tokens.cursor = initialCursor
                    return comma
                }
            }
        }

    if (currentToken.type != TokenType.ParenEnclosed || tokens.isFinished) {
        return functionPrototype
    }

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parseParam = () => {
        currentToken = parenTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(parenTokens, skipables)

        let param: AssignExpr | Pattern | MismatchToken = generateAssignExpr(functionPrototype, parenTokens)

        if (param.type == "MismatchToken")
            param = generatePattern(functionPrototype, parenTokens)

        return param
    }

    while (!parenTokens.isFinished) {
        const param = parseParam()

        if (param.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return param
        }

        functionPrototype.params.push(param)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    currentToken = tokens.currentToken

    if (isOperator(currentToken, "::")) {

        const signature = captureSignature()
        if (signature.type == "MismatchToken")
            return signature

        if (functionPrototype.signature !== null)
            return createMismatchToken(currentToken)

        functionPrototype.signature = signature
    } */

    return functionPrototype
}