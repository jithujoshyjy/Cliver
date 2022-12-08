import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { generateProgram } from "../../../program.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../../../utility.js"
import { generateAssignExpr } from "../../expression/assign-expression.js"
import { generatePattern } from "../../expression/pattern.js"
import { generateTypeExpression } from "../../type/type-expression.js"
import { generateIdentifier } from "../identifier.js"

export function generateBlockAnonFunction(context: Node, tokens: TokenStream): BlockAnonFunction | MismatchToken {
    const blockAnonFunction: BlockAnonFunction = {
        type: "BlockAnonFunction",
        body: [],
        kind: ["return"],
        params: [],
        signature: null,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables) // skip fun
    const initialCursor = tokens.cursor

    const captureSignature = () => {
        currentToken = skip(tokens, skipables) // skip ::
        const signature = generateTypeExpression(blockAnonFunction, tokens)
        return signature
    }

    if (isOperator(currentToken, "::")) {
        const signature = captureSignature()
        if (signature.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return signature
        }
        blockAnonFunction.signature = signature
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

    const captureFunctionKind = () => {
        currentToken = skip(tokens, skipables)
        const name = generateIdentifier(blockAnonFunction, tokens)
        return name
    }

    if (isOperator(currentToken, "<"))
        while (!tokens.isFinished) {

            const kind = captureFunctionKind()
            if (kind.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return kind
            }

            blockAnonFunction.kind.push(kind.name as FunctionKind)

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

        let param: AssignExpr | Pattern | MismatchToken = generateAssignExpr(blockAnonFunction, parenTokens)

        if (param.type == "MismatchToken")
            param = generatePattern(blockAnonFunction, parenTokens)

        return param
    }

    while (!parenTokens.isFinished) {
        const param = parseParam()

        if (param.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return param
        }

        blockAnonFunction.params.push(param)
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

        if (blockAnonFunction.signature !== null)
            return createMismatchToken(currentToken)

        blockAnonFunction.signature = signature
    }

    const nodes = generateProgram(blockAnonFunction, tokens)

    for (let node of nodes) {

        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "end"))
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        blockAnonFunction.body.push(node)
    }

    return blockAnonFunction
}