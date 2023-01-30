import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, skipables, type Node, NodePrinter, pickPrinter } from "../../utility.js"
import { generateExpression, printExpression } from "../expression/expression.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateFunctionPrototype, printFunctionPrototype } from "./function-prototype.js"
import { generatePair, printPair } from "./pair.js"

export function generateCallSiteArgsList(context: Node, tokens: TokenStream): CallSiteArgsList | MismatchToken {
    const callSiteArgsList: CallSiteArgsList = {
        type: "CallSiteArgsList",
        positional: [],
        keyword: [],
        captured: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, '(')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)

    let lastDelim: LexicalToken | MismatchToken | null = null
    let isInitial = true, argType: "positional" | "keyword" | "captured" = "positional"

    const parseArg = <T extends typeof argType>(argType: T) => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        let arg: FunctionPrototype
            | Expression
            | Pair
            | Identifier
            | MismatchToken = null!

        const positionalArgGenerators = [generateFunctionPrototype, generatePair, generateExpression]
        const keywordArgGenerators = [generatePair]
        const captureArgGenerators = [generateIdentifier]

        const argGenerators = argType == "positional"
            ? positionalArgGenerators
            : argType == "keyword"
                ? keywordArgGenerators
                : captureArgGenerators

        for (const argGenerator of argGenerators) {
            arg = argGenerator(callSiteArgsList, tokens)
            currentToken = tokens.currentToken

            if (arg.type != "MismatchToken")
                break

            if (arg.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return arg
            }
        }

        lastDelim = null
        return arg
    }

    const captureComma = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ","))
            return createMismatchToken(initialToken)

        currentToken = skip(tokens, skipables)
        return initialToken
    }

    let semicolonCount = 0
    const captureSemicolon = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ";"))
            return createMismatchToken(initialToken)

        semicolonCount++
        currentToken = skip(tokens, skipables)
        return initialToken
    }

    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, ")")) {
            callSiteArgsList.end = currentToken.end
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

        const param = parseArg(argType)

        if (param.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return param
        }

        callSiteArgsList[argType].push(param as any)

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

    return callSiteArgsList
}

export function printCallSiteArgsList(token: CallSiteArgsList, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const posArgPrinters = [
        printPair, printExpression, printFunctionPrototype
    ] as NodePrinter[]
    const kwArgPrinters = [
        printPair, printIdentifier
    ] as NodePrinter[]

    const space = ' '.repeat(4)
    return "CallSiteArgsList\n" + space.repeat(indent) +

        (!!token.positional.length && !!token.keyword.length && !!token.captured.length
            ? middleJoiner
            : endJoiner) +

        (token.positional.length ? "positional\n" +
            token.positional.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                pickPrinter(posArgPrinters, c)!(c, indent + 2) + '\n', '') : "") +

        (token.keyword.length ? (token.positional.length ? space.repeat(indent) + endJoiner : "") + "keyword\n" +
            token.keyword.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                pickPrinter(kwArgPrinters, c)!(c, indent + 2) + '\n', '') : "") +

        (token.captured.length ? (token.positional.length && token.keyword.length
            ? space.repeat(indent) + endJoiner
            : "") +
            "captured\n" +
            token.captured.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printIdentifier(c, indent + 2) + '\n', '') : "")

}