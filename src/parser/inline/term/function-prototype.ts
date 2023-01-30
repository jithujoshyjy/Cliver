import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node, isKeyword } from "../../utility.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateKeyword } from "../keyword.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateTypeExpression } from "../type/type-expression.js"

export function generateFunctionPrototype(context: Node, tokens: TokenStream): FunctionPrototype | MismatchToken {
    const functionPrototype: FunctionPrototype = {
        type: "FunctionPrototype",
        kind: ["return"],
        positional: [],
        keyword: [],
        captured: [],
        signature: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const funKeyword = generateKeyword(functionPrototype, tokens)

    if (funKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return funKeyword
    }

    if (!isKeyword(funKeyword, "fun")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    functionPrototype.start = funKeyword.start
    functionPrototype.line = funKeyword.line
    functionPrototype.column = funKeyword.column

    const captureSignature = () => {
        currentToken = skip(tokens, skipables)
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
        const initialToken = tokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(initialToken)
        }

        currentToken = skip(tokens, skipables)
        return initialToken
    }

    let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
    const captureFunctionKind = () => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const nodeGenerators = [
            generateIdentifier, generateKeyword
        ]

        let kind: Identifier
            | Keyword
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            kind = nodeGenerator(functionPrototype, tokens)
            currentToken = tokens.currentToken

            if (kind.type != "MismatchToken")
                break

            if (kind.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return kind
            }
        }

        lastDelim = null
        return kind
    }

    if (isOperator(currentToken, "<")) {
        currentToken = skip(tokens, skipables)

        while (!tokens.isFinished) {

            if (isPunctuator(currentToken, ">")) {
                functionPrototype.end = currentToken.end
                tokens.advance()
                break
            }

            if (!isInitial && lastDelim == null) {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }

            if (lastDelim?.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return lastDelim
            }

            const kind = captureFunctionKind()

            if (kind.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return kind
            }

            functionPrototype.kind.push(kind)
            if (skipables.includes(currentToken))
                currentToken = skip(tokens, skipables)

            lastDelim = captureComma()
            isInitial = false
        }
    }

    if (!isPunctuator(currentToken, '('))
        return functionPrototype

    currentToken = skip(tokens, skipables)

    lastDelim = null, isInitial = true
    let argType: "positional" | "keyword" | "captured" = "positional"

    const parseParam = <T extends typeof argType>(argType: T) => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        let param: AssignExpr
            | Pattern
            | Identifier
            | MismatchToken = null!

        const positionalParamGenerators = [generateAssignExpr, generatePattern]
        const keywordParamGenerators = [generateAssignExpr]
        const captureParamGenerators = [generateIdentifier]

        const paramGenerators = argType == "positional"
            ? positionalParamGenerators
            : argType == "keyword"
                ? keywordParamGenerators
                : captureParamGenerators

        for (const paramGenerator of paramGenerators) {
            param = paramGenerator(functionPrototype, tokens)
            currentToken = tokens.currentToken

            if (param.type != "MismatchToken")
                break

            if (param.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return param
            }
        }

        lastDelim = null
        return param
    }

    let semicolonCount = 0
    const captureSemicolon = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ";")) {
            return createMismatchToken(initialToken)
        }

        semicolonCount++
        currentToken = skip(tokens, skipables)
        return initialToken
    }

    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, ")")) {
            functionPrototype.end = currentToken.end
            tokens.advance()
            break
        }

        if (!isInitial && lastDelim == null) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        if (lastDelim?.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return lastDelim
        }

        const param = parseParam(argType)

        if (param.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return param
        }

        functionPrototype[argType].push(param as any)

        currentToken = skipables.includes(currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        lastDelim = captureComma()

        if (lastDelim.type == "MismatchToken")
            lastDelim = captureSemicolon()

        if (lastDelim.type != "MismatchToken" && isPunctuator(lastDelim, ";")) {
            argType = "keyword"
            if (semicolonCount == 2) {
                argType = "captured"
            }
            else if (semicolonCount > 2) {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }
        }

        isInitial = false
    }

    currentToken = tokens.currentToken
    if (isOperator(currentToken, "::")) {
        currentToken = skip(tokens, skipables)

        const signature = captureSignature()
        if (signature.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return signature
        }

        if (functionPrototype.signature !== null) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        functionPrototype.signature = signature
    }

    return functionPrototype
}

export function printFunctionPrototype(token: FunctionPrototype, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "FunctionPrototype\n"
}