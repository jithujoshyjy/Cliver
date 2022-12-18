import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateFunctionPrototype } from "./function-prototype.js"
import { generatePair } from "./pair.js"

export function generateCallSiteArgsList(context: Node, tokens: TokenStream): CallSiteArgsList | MismatchToken {
    const callSiteArgsList: CallSiteArgsList = {
        type: "CallSiteArgsList",
        positional: [],
        keyword: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isPunctuator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const parseArg = (isKeyword: boolean, parenTokens: TokenStream) => {
        currentToken = parenTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(parenTokens, skipables)

        let arg: Pair
            | Expression
            | Identifier
            | FunctionPrototype
            | MismatchToken = null!

        const positionalGenerators = [generateExpression, generateFunctionPrototype]
        const keywordGenerators = [generateIdentifier]
        const nodeGenerators = [
            generatePair, ...(!isKeyword ? positionalGenerators : keywordGenerators),
        ]

        for (const nodeGenerator of nodeGenerators) {
            arg = nodeGenerator(callSiteArgsList, tokens)
            currentToken = tokens.currentToken
            if (arg.type != "MismatchToken")
                break
        }

        return arg
    }

    const parseArgs = (isKeyword = false, parenTokens: TokenStream) => {
        const args: Array<Pair
            | Identifier
            | Expression
            | FunctionPrototype> = []

        while (!parenTokens.isFinished) {
            const arg = parseArg(isKeyword, parenTokens)

            if (arg.type == "MismatchToken" && isPunctuator(currentToken, ";")) {
                return args
            }

            if (arg.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return arg
            }

            args.push(arg)
            if (!tokens.isFinished) {
                const comma = captureComma()

                if (comma.type == "MismatchToken" && isPunctuator(currentToken, ";")) {
                    return args
                }

                if (comma.type == "MismatchToken") {
                    tokens.cursor = initialCursor
                    return comma
                }
            }
        }

        return args
    }

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    const positionalArgs = parseArgs(false, parenTokens)

    if (!Array.isArray(positionalArgs)) {
        tokens.cursor = initialCursor
        return positionalArgs
    }

    callSiteArgsList.positional = positionalArgs as Array<Pair | Expression | FunctionPrototype>

    if (isPunctuator(currentToken, ";")) {
        currentToken = skip(parenTokens, skipables) // skip ;
        const keywordArgs = parseArgs(true, parenTokens)

        if (!Array.isArray(keywordArgs)) {
            tokens.cursor = initialCursor
            return keywordArgs
        }

        const areValidKwargs = keywordArgs.every(x => {
            if (x.type == "Pair") {
                const maybeLiteral = x.key
                if (maybeLiteral.type != "Literal")
                    return false

                const maybeIdentifier = maybeLiteral.value
                if (maybeIdentifier.type != "Identifier")
                    return false

                return true
            }

            return true
        })

        if (!areValidKwargs) {
            tokens.cursor = initialCursor
            const error = `Invalid keyword arguments on ${currentToken.line}:${currentToken.column}`
            return createMismatchToken(currentToken, error)
        }

        callSiteArgsList.keyword = keywordArgs as Array<Pair | Identifier>
    }

    return callSiteArgsList
}