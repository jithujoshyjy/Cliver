import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, skipables, _skipables, type Node, DiagnosticMessage, pickPrinter, NodePrinter } from "../../../utility.js"
import { generateExpression, printExpression } from "../../expression/expression.js"
import { generateEscapeSequence } from "../../literal/escape-sequence.js"
import { generateIdentifier, printIdentifier } from "../../literal/identifier.js"
import { printStringLiteral } from "../../literal/string-literal.js"
import { generatePair, printPair } from "../pair.js"
import { printInStringExpr, printInStringId } from "./tagged-string.js"

export function generateInlineFStringFragment(context: Node, tokens: TokenStream): InlineFStringFragment | MismatchToken {

    const inlineFStringFragment: InlineFStringFragment = {
        type: "InlineFStringFragment",
        fragments: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0,
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    while (!tokens.isFinished) {

        const fstring = parseFstring()
        if (fstring.type == "MismatchToken" && inlineFStringFragment.fragments.length == 0) {
            tokens.cursor = initialCursor
            return fstring
        }

        if (fstring.type == "MismatchToken" && fstring.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return fstring
        }

        if (fstring.type == "MismatchToken")
            break

        inlineFStringFragment.fragments.push(fstring)
    }

    if (inlineFStringFragment.fragments.length == 0) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return inlineFStringFragment

    function parseFstring() {

        const fstring: InlineFString = {
            type: "InlineFString",
            fragments: [],
            line: 0,
            column: 0,
            start: 0,
            end: 0
        }

        let currentToken = tokens.currentToken
        const initialCursor = tokens.cursor

        if (!isPunctuator(currentToken, '"')) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        tokens.advance()
        let isInitial = true

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

            let fragment: InlineStringLiteral
                | InStringExpr
                | InStringId
                | MismatchToken = null!

            if (isPunctuator(currentToken, '"')) {
                fstring.end = currentToken.end
                tokens.advance()
                break
            }

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
                fstring.fragments.push(fragment)

            isInitial = false
        }

        return fstring

        function createStringLiteral(): InlineStringLiteral {
            return {
                type: "StringLiteral",
                text: "",
                charset: "ascii",
                kind: "inline",
                start: 0,
                end: 0,
                line: 0,
                column: 0
            }
        }

        function parseString() {
            let currentToken = tokens.currentToken

            const lastFragment = fstring.fragments.at(-1)
            const stringLiteral = lastFragment?.type == "StringLiteral"
                ? lastFragment
                : createStringLiteral()

            if (lastFragment?.type != "StringLiteral")
                fstring.fragments.push(stringLiteral)

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

            const escapeSequence = generateEscapeSequence(fstring, tokens)

            if (escapeSequence.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return escapeSequence
            }

            const lastFragment = fstring.fragments.at(-1)
            const stringLiteral = lastFragment?.type == "StringLiteral"
                ? lastFragment
                : createStringLiteral()

            if (lastFragment?.type != "StringLiteral")
                fstring.fragments.push(stringLiteral)

            if (isInitial) {
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
}

export function printInlineFStringFragment(token: InlineFStringFragment, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    
    const instringElementPrinters = [
        printStringLiteral, printInStringId
    ] as NodePrinter[]

    const space = ' '.repeat(4)
    return "InlineFStringFragment" +
        '\n' + space.repeat(indent) + endJoiner + "fragments" +
        token.fragments.reduce((a, c, i, arr) =>
            a + '\n' + space.repeat(indent + 1) +
            (i < arr.length - 1 ? middleJoiner : endJoiner) + "sub-fragments" +
            c.fragments.reduce((a, c, i, arr) =>
                a + '\n' + space.repeat(indent + 2) +
                (i < arr.length - 1 ? middleJoiner : endJoiner) +
                (c.type == "InStringExpr"
                    ? printInStringExpr(c, indent + 3)
                    : pickPrinter(instringElementPrinters, c)!(c, indent + 3)), "")
            , "")
}