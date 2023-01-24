import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, _skipables, type Node, DiagnosticMessage, NodePrinter, pickPrinter } from "../../../utility.js"
import { generateExpression, printExpression } from "../../expression/expression.js"
import { generateGroupExpression, printGroupExpression } from "../../expression/group-expression.js"
import { generateEscapeSequence } from "../../literal/escape-sequence.js"
import { generateIdentifier, printIdentifier } from "../../literal/identifier.js"
import { printStringLiteral } from "../../literal/string-literal.js"
import { generateFunctionCall, printFunctionCall } from "../function-call.js"
import { generatePair, printPair } from "../pair.js"
import { generatePropertyAccess, printPropertyAccess } from "../property-access.js"

export function generateMultilineTaggedString(context: Node, tokens: TokenStream): MultilineTaggedString | MismatchToken {

    const multilineTaggedString: MultilineTaggedString = {
        type: "MultilineTaggedString",
        fragments: [],
        tag: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        /* generateFunctionCall, generatePropertyAccess, */
        generateIdentifier, generateGroupExpression
    ]

    let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        tag = nodeGenerator(multilineTaggedString, tokens)
        currentToken = tokens.currentToken

        if (tag.type != "MismatchToken")
            break

        if (tag.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return tag
        }
    }

    if (tag.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return tag
    }

    multilineTaggedString.start = tag.start
    multilineTaggedString.line = tag.line
    multilineTaggedString.column = tag.column
    multilineTaggedString.tag = tag

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    let startQuoteCount = 0
    while (isPunctuator(currentToken, '"')) {
        startQuoteCount++
        tokens.advance()
        currentToken = tokens.currentToken
    }

    if (startQuoteCount < 3) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const captureEOF = () => {
        const currentToken = tokens.currentToken
        if (currentToken.type != "EOF")
            return createMismatchToken(currentToken)

        tokens.cursor = initialCursor
        const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
        return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
    }

    const fragmentGenerators = [
        captureEOF, parseEscapeSequence, parseInStringExpression, parseInStringId, parseString
    ]

    while (!tokens.isFinished) {
        currentToken = tokens.currentToken

        let fragment: MultilineStringLiteral
            | InStringExpr
            | InStringId
            | MismatchToken = null!

        let endQuoteCount = startQuoteCount, resetCursorPoint = tokens.cursor
        while (isPunctuator(currentToken, '"')) {
            if (endQuoteCount == 0)
                break

            endQuoteCount--
            tokens.advance()
            currentToken = tokens.currentToken
        }

        if (endQuoteCount == 0) {
            multilineTaggedString.end = currentToken.end
            break
        }

        tokens.cursor = resetCursorPoint
        currentToken = tokens.currentToken

        for (let fragmentGenerator of fragmentGenerators) {
            fragment = fragmentGenerator()
            currentToken = tokens.currentToken

            if (fragment.type != "MismatchToken")
                break

            if (fragment.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return fragment
            }
        }

        if (fragment.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return fragment
        }

        if (fragment.type != "StringLiteral")
            multilineTaggedString.fragments.push(fragment)
    }


    return multilineTaggedString

    function createStringLiteral(): MultilineStringLiteral {
        return {
            type: "StringLiteral",
            text: "",
            charset: "ascii",
            kind: "multiline",
            start: 0,
            end: 0,
            line: 0,
            column: 0
        }
    }

    function parseString() {
        let currentToken = tokens.currentToken

        const lastFragment = multilineTaggedString.fragments.at(-1)
        const stringLiteral = lastFragment?.type == "StringLiteral"
            ? lastFragment
            : createStringLiteral()

        if (lastFragment?.type != "StringLiteral") {
            multilineTaggedString.fragments.push(stringLiteral)
            stringLiteral.start = currentToken.start
            stringLiteral.line = currentToken.line
            stringLiteral.column = currentToken.column
        }

        stringLiteral.text += currentToken.value
        stringLiteral.charset = stringLiteral.charset == "ascii" &&
            /^[\u0000-\u007F]+$/.test(currentToken.value) ? "ascii" : "unicode"

        stringLiteral.end = currentToken.end
        tokens.advance()

        return stringLiteral
    }

    function parseEscapeSequence() {

        let currentToken = tokens.currentToken
        const initialCursor = tokens.cursor

        if (!isPunctuator(currentToken, '\\')) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        const escapeSequence = generateEscapeSequence(multilineTaggedString, tokens)

        if (escapeSequence.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return escapeSequence
        }

        const lastFragment = multilineTaggedString.fragments.at(-1)
        const stringLiteral = lastFragment?.type == "StringLiteral"
            ? lastFragment
            : createStringLiteral()

        if (lastFragment?.type != "StringLiteral") {
            multilineTaggedString.fragments.push(stringLiteral)

            stringLiteral.start = escapeSequence.start
            stringLiteral.line = escapeSequence.line
            stringLiteral.column = escapeSequence.column
        }

        stringLiteral.text += escapeSequence.value + escapeSequence.trailing
        stringLiteral.charset = stringLiteral.charset == "ascii" &&
            /^[\u0000-\u007F]+$/.test(escapeSequence.value + escapeSequence.trailing)
            ? "ascii" : "unicode"

        stringLiteral.end = escapeSequence.end + escapeSequence.trailing.length
        return stringLiteral
    }

    function parseInStringId() {
        const instringId: InStringId = {
            type: "InStringId",
            value: null!,
            line: 0,
            column: 0,
            start: 0,
            end: 0
        }

        let currentToken = tokens.currentToken
        const initialCursor = tokens.cursor

        if (!isPunctuator(currentToken, '$')) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        instringId.start = currentToken.start
        instringId.line = currentToken.line
        instringId.column = currentToken.column

        tokens.advance()
        const identifier = generateIdentifier(instringId, tokens)

        if (identifier.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return identifier
        }

        instringId.end = identifier.end
        instringId.value = identifier
        return instringId
    }

    function parseInStringExpression() {
        const instringExpr: InStringExpr = {
            type: "InStringExpr",
            positional: [],
            keyword: [],
            line: 0,
            column: 0,
            start: 0,
            end: 0,
        }

        let currentToken = tokens.currentToken
        const initialCursor = tokens.cursor

        if (!isPunctuator(currentToken, '{')) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        instringExpr.line = currentToken.line
        instringExpr.column = currentToken.column
        instringExpr.start = currentToken.start

        currentToken = skip(tokens, skipables)
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

        let lastDelim: LexicalToken | MismatchToken | null = null
        const parseValue = () => {

            const nodeGenerators = [generatePair, generateExpression]

            let value: Pair | Expression | MismatchToken = null!
            for (const nodeGenerator of nodeGenerators) {

                value = nodeGenerator(instringExpr, tokens)
                currentToken = tokens.currentToken

                if (value.type != "MismatchToken")
                    break

                if (value.errorDescription.severity <= 3) {
                    tokens.cursor = initialCursor
                    return value
                }
            }

            lastDelim = null
            return value
        }

        let isInitial = true, argType: "positional" | "keyword" = "positional"
        while (!tokens.isFinished) {

            if (isPunctuator(currentToken, "}")) {
                instringExpr.end = currentToken.end
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

            if (!isPunctuator(currentToken, ";")) {
                const value = parseValue()

                if (value.type == "MismatchToken") {
                    tokens.cursor = initialCursor
                    return value
                }

                if (isInitial && value.type == "Pair")
                    argType = "keyword"

                while (value.type == "Pair") {

                    const maybeLiteral = value.key
                    let type: string = maybeLiteral.type

                    if (maybeLiteral.type == "Literal") {

                        const maybeIdentifier = maybeLiteral.value
                        if (maybeIdentifier.type == "Identifier")
                            break

                        type = maybeIdentifier.type
                    }

                    const { line, column } = currentToken
                    const error: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

                    tokens.cursor = initialCursor
                    return createMismatchToken(currentToken, [error, type, line, column])
                }

                while (argType == "keyword" && value.type == "Expression") {
                    const maybeLiteral = value.value
                    let type: string = maybeLiteral.type

                    if (maybeLiteral.type == "Literal") {

                        const maybeIdentifier = maybeLiteral.value
                        if (maybeIdentifier.type == "Identifier")
                            break

                        type = maybeIdentifier.type
                    }

                    const { line, column } = currentToken
                    const error: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

                    tokens.cursor = initialCursor
                    return createMismatchToken(currentToken, [error, type, line, column])
                }

                instringExpr[argType].push(value as any)
            }

            if (skipables.includes(currentToken))
                currentToken = skip(tokens, skipables)

            lastDelim = captureComma()

            if (lastDelim.type == "MismatchToken")
                lastDelim = captureSemicolon()

            if (lastDelim.type != "MismatchToken" && isPunctuator(lastDelim, ";")) {
                argType = "keyword"
                if (semicolonCount > 1) {
                    tokens.cursor = initialCursor
                    return createMismatchToken(currentToken)
                }
            }

            isInitial = false
        }
        return instringExpr
    }
}

export function printMultilineTaggedString(token: MultilineTaggedString, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const tagPrinters = [
        printIdentifier, printPropertyAccess, printFunctionCall, printGroupExpression
    ] as NodePrinter[]

    const instringElementPrinters = [
        printStringLiteral, printIdentifier
    ] as NodePrinter[]

    const tagPrinter = pickPrinter(tagPrinters, token.tag)!

    const space = ' '.repeat(4)
    return "MultilineTaggedString" +
        '\n' + space.repeat(indent) + endJoiner + "tag" +
        '\n' + space.repeat(indent + 1) + endJoiner + tagPrinter(token.tag, indent + 2) +
        '\n' + space.repeat(indent) + endJoiner + "fragments" +
        token.fragments.reduce((a, c, i, arr) =>
            a + '\n' + space.repeat(indent + 2) +
            (i < arr.length - 1 ? middleJoiner : endJoiner) +
            (c.type == "InStringExpr"
                ? "InStringExpr\n" + space.repeat(indent + 3) +

                (!!c.positional.length && !!c.keyword.length ? middleJoiner : endJoiner) +

                (c.positional.length ? "positional\n" +
                    c.positional.reduce((a, c, i, arr) => a + space.repeat(indent + 4) +
                        (i == arr.length - 1 ? endJoiner : middleJoiner) +
                        printExpression(c, indent + 5) + '\n', '') : "") +

                (c.keyword.length ? (c.positional.length ? space.repeat(indent + 4) + endJoiner : "") + "keyword\n" +
                    c.keyword.reduce((a, c, i, arr) => a + space.repeat(indent + 5) +
                        (i == arr.length - 1 ? endJoiner : middleJoiner) +
                        printPair(c, indent + 6) + '\n', '') : "")
                : pickPrinter(instringElementPrinters, c)!(c, indent + 5)), "")
}
