import { TokenStream } from "../../../lexer/token.js"
import { createDiagnosticMessage, createMismatchToken, DiagnosticMessage, isPunctuator, type Node } from "../../utility.js"

export function generateEscapeSequence(context: Node, tokens: TokenStream): EscapeSequence | MismatchToken {
    let escapeSequence: EscapeSequence = {
        type: "EscapeSequence",
        value: null!,
        kind: "regular",
        trailing: "",
        raw: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    if (!isPunctuator(currentToken, '\\')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    escapeSequence.start = currentToken.start
    escapeSequence.line = currentToken.line
    escapeSequence.column = currentToken.column

    tokens.advance()
    currentToken = tokens.currentToken

    const startsWithU = () => /^u/i.test(currentToken.value)
    const startsWithX = () => /^x/i.test(currentToken.value)

    if (currentToken.type == "Word" && startsWithU()) {
        const unicodeSequence = parseUnicodeSequence(tokens)

        if (unicodeSequence.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return unicodeSequence
        }

        unicodeSequence.start = escapeSequence.start
        escapeSequence = unicodeSequence
    }
    else if (currentToken.type == "Word" && startsWithX()) {
        const hexSequence = parseHexEscape(tokens)
        if (hexSequence.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return hexSequence
        }

        hexSequence.start = escapeSequence.start
        escapeSequence = hexSequence
    }
    else {
        escapeSequence.raw = currentToken.value.substring(0, 1)

        if (escapeSequence.raw === "") {
            const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
            return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
        }

        tokens.advance()
        escapeSequence.trailing = currentToken.value.substring(1)
        escapeSequence.value = eval(`"\\${escapeSequence.raw}"`)
        escapeSequence.end = currentToken.start
    }

    return escapeSequence

    function parseUnicodeSequence(tokens: TokenStream) {
        const escapeSequence: EscapeSequence = {
            type: "EscapeSequence",
            value: null!,
            kind: "quadHex",
            raw: currentToken.value.substring(1, 5),
            trailing: currentToken.value.substring(5),
            line: 0,
            column: 0,
            start: 0,
            end: 0
        }

        if (escapeSequence.raw === "" && tokens.peek(1)?.value === "{") {

            tokens.advance()
            currentToken = tokens.currentToken // "{"

            if (!isPunctuator(currentToken, "{")) {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }

            tokens.advance() // skip {
            currentToken = tokens.currentToken

            escapeSequence.kind = "polyHex"
            while (!tokens.isFinished) {

                currentToken = tokens.currentToken
                if (currentToken.type == "EOF") {
                    tokens.cursor = initialCursor
                    const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
                    return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
                }

                if (isPunctuator(currentToken, "}")) {
                    escapeSequence.end = currentToken.end
                    tokens.advance()
                    break
                }

                const isValidSequence = ["Word", "Integer"].includes(currentToken.type)
                    && /^[a-f0-9]+$/i.test(currentToken.value)

                if (!isValidSequence) {
                    tokens.cursor = initialCursor
                    const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
                    return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
                }

                escapeSequence.raw += currentToken.value
                tokens.advance()
            }

            if (escapeSequence.raw.length === 0)
                return createMismatchToken(currentToken)

            escapeSequence.value = String.fromCodePoint(Number.parseInt(`0x${escapeSequence.raw}`))
            return escapeSequence
        }

        while (!tokens.isFinished && escapeSequence.raw.length < 4) {
            tokens.advance()
            currentToken = tokens.currentToken

            if (currentToken.type == "EOF") {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
                return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
            }

            const isValidSequence = ["Word", "Integer"].includes(currentToken.type)
                && /^[a-f0-9]+$/i.test(currentToken.value)

            if (!isValidSequence) {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Invalid Unicode escape sequence on {0}:{1}"
                return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
            }

            escapeSequence.trailing = currentToken.value.substring(4 - escapeSequence.raw.length)
            escapeSequence.raw += currentToken.value.substring(0, 4 - escapeSequence.raw.length)
        }

        if (escapeSequence.raw.length === 0)
            return createMismatchToken(currentToken)

        tokens.advance()
        escapeSequence.end = currentToken.end - escapeSequence.trailing.length
        escapeSequence.value = String.fromCodePoint(Number.parseInt(`0x${escapeSequence.raw}`))
        return escapeSequence
    }

    function parseHexEscape(tokens: TokenStream) {
        const escapeSequence: EscapeSequence = {
            type: "EscapeSequence",
            value: null!,
            kind: "doubleHex",
            raw: currentToken.value.substring(1, 3),
            trailing: currentToken.value.substring(3),
            line: 0,
            column: 0,
            start: 0,
            end: 0
        }

        while (!tokens.isFinished && escapeSequence.raw.length < 2) {
            tokens.advance()
            currentToken = tokens.currentToken

            if (currentToken.type == "EOF") {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
                return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
            }

            const isValidSequence = ["Word", "Integer"].includes(currentToken.type)
                && /^[a-f0-9]+$/i.test(currentToken.value)

            if (!isValidSequence) {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Invalid Hexadecimal escape sequence on {0}:{1}"
                return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
            }

            escapeSequence.trailing = currentToken.value.substring(2 - escapeSequence.raw.length)
            escapeSequence.raw += currentToken.value.substring(0, 2 - escapeSequence.raw.length)
        }

        if (escapeSequence.raw.length === 0)
            return createMismatchToken(currentToken)

        tokens.advance()
        escapeSequence.end = currentToken.end - escapeSequence.trailing.length
        escapeSequence.value = String.fromCodePoint(Number.parseInt(`0x${escapeSequence.raw}`))
        return escapeSequence
    }
}