import { TokenStream } from "../../lexer/token.js"
import { generateAssignExpr } from "../inline/expression/assign-expression.js"
import { generatePattern } from "../inline/expression/pattern/pattern.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateTypeExpression } from "../inline/type/type-expression.js"
import { generateProgram } from "../program.js"
import { createMismatchToken, isKeyword, isOperator, isPunctuator, skip, skipables, type Node } from "../utility.js"

export function generateNamedFunction(context: string[], tokens: TokenStream): NamedFunction | MismatchToken {
    const namedFunction: NamedFunction = {
        type: "NamedFunction",
        body: [],
        kind: ["return"],
        name: null!,
        params: [],
        signature: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    /* const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(namedFunction, tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if (signature.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return signature
        }
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
        if (!isPunctuator(currentToken, ",")) {
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

    if (currentToken.type != "Punctuator") {
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
        if(!parenTokens.isFinished) {
            const comma = captureComma()

            if (comma.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return comma
            }
        }
    }

    currentToken = tokens.currentToken

    if (isOperator(currentToken, "::")) {

        const signature = captureSignature()
        if (signature.type == "MismatchToken")
            return signature

        if (namedFunction.signature !== null)
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
    } */

    return /* namedFunction */ createMismatchToken(currentToken)
}

export function printNamedFunction(token: NamedFunction, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "NamedFunction\n"
}
