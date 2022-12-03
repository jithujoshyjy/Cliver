import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateAssignExpr } from "../inline/expression/assign-expression.js"
import { generatePattern } from "../inline/expression/pattern.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateTypeExpression } from "../inline/type/type-expression.js"
import { generateProgram } from "../program.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../utility"

export function generateNamedFunction(context: Node, tokens: TokenStream): NamedFunction | MismatchToken {
    const namedFunction: NamedFunction = {
        type: "NamedFunction",
        body: [],
        kind: ["return"],
        name: null!,
        params: [],
        signature: null,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables) // skip fun
    const initialCursor = tokens.cursor

    const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(namedFunction, tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if(signature.type == "MismatchToken")
            return signature
        namedFunction.signature = signature
    }
    const name = generateIdentifier(namedFunction, tokens)

    if (name.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return name
    }

    namedFunction.name = name
    currentToken = skip(tokens, skipables)

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const captureFunctionKind = () => {
        currentToken = skip(tokens, skipables)
        const name = generateIdentifier(namedFunction, tokens)
        return name
    }

    if (isOperator(currentToken, "<"))
        while (!tokens.isFinished) {

            const kind = captureFunctionKind()
            if (kind.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return kind
            }

            namedFunction.kind.push(kind.name as FunctionKind)

            const comma = captureComma()
            if (comma.type == "MismatchToken" && isOperator(currentToken, ">")) {
                currentToken = skip(tokens, skipables)
                break
            }
            else if (comma.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return comma
            }
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

        let param: AssignExpr | Pattern | MismatchToken = generateAssignExpr(namedFunction, parenTokens)

        if (param.type == "MismatchToken")
            param = generatePattern(namedFunction, parenTokens)

        return param
    }

    while (!parenTokens.isFinished) {
        const param = parseParam()

        if (param.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return param
        }

        namedFunction.params.push(param)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    currentToken = tokens.currentToken

    if(isOperator(currentToken, "::")) {
        
        const signature = captureSignature()
        if(signature.type == "MismatchToken")
            return signature

        if(namedFunction.signature !== null)
            return createMismatchToken(currentToken)
        
        namedFunction.signature = signature
    }

    const nodes = generateProgram(namedFunction, tokens)

    for (let node of nodes) {

        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "end"))
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        namedFunction.body.push(node)
    }

    return namedFunction
}
