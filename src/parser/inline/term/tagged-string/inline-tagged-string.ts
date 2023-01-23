import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, _skipables, type Node, DiagnosticMessage } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"
import { generateGroupExpression } from "../../expression/group-expression.js"
import { generateEscapeSequence } from "../../literal/escape-sequence.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateFunctionCall } from "../function-call.js"
import { generatePair } from "../pair.js"
import { generatePropertyAccess } from "../property-access.js"

export function generateInlineTaggedString(context: Node, tokens: TokenStream): InlineTaggedString | MismatchToken {

    const inlineTaggedString: InlineTaggedString = {
        type: "InlineTaggedString",
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
        tag = nodeGenerator(inlineTaggedString, tokens)
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

    inlineTaggedString.start = tag.start
    inlineTaggedString.line = tag.line
    inlineTaggedString.column = tag.column
    inlineTaggedString.tag = tag

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    while (!tokens.isFinished) {

        const fstring = parseFstring()
        if (fstring.type == "MismatchToken" && inlineTaggedString.fragments.length == 0) {
            tokens.cursor = initialCursor
            return fstring
        }

        if (fstring.type == "MismatchToken" && fstring.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return fstring
        }

        if (fstring.type == "MismatchToken")
            break

        inlineTaggedString.fragments.push(fstring)
    }

    if (inlineTaggedString.fragments.length == 0) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return inlineTaggedString

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