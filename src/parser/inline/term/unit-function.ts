import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node, isPunctuator } from "../../utility.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generateExpression } from "../expression/expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateIdentifier } from "../literal/identifier.js"

export function generateUnitFunction(context: Node, tokens: TokenStream): UnitFunction | MismatchToken {
    const unitFunction: UnitFunction = {
        type: "UnitFunction",
        positional: [],
        keyword: [],
        captured: [],
        signature: null,
        body: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (isPunctuator(currentToken, '(')) {
        currentToken = skip(tokens, skipables)

        let lastDelim: LexicalToken | MismatchToken | null = null
        let isInitial = true, argType: "positional" | "keyword" | "captured" = "positional"

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
                param = paramGenerator(unitFunction, tokens)
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

        const captureComma = () => {
            const initialToken = tokens.currentToken

            if (!isPunctuator(initialToken, ",")) {
                return createMismatchToken(initialToken)
            }

            currentToken = skip(tokens, skipables)
            return initialToken
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
                unitFunction.end = currentToken.end
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

            unitFunction[argType].push(param as any)

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
    }
    else {

        let identifier: Identifier
            | MismatchToken = generateIdentifier(unitFunction, tokens)

        if (identifier.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return identifier
        }

        const literal: Literal = {
            type: "Literal",
            value: identifier,
            line: identifier.line,
            column: identifier.column,
            start: identifier.start,
            end: identifier.end
        }

        const pattern: Pattern = {
            type: "Pattern",
            body: literal,
            line: literal.line,
            column: literal.column,
            start: literal.start,
            end: literal.end
        }

        unitFunction.positional.push(pattern)
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken


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

    unitFunction.end = body.end
    unitFunction.body = body

    return unitFunction
}