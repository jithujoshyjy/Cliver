import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isPunctuator, type Node } from "../../utility.js"

export function generateEscapeSequence(context: Node, tokens: TokenStream): EscapeSequence | MismatchToken {
    let escapeSequence: EscapeSequence = {
        type: "EscapeSequence",
        value: null!,
        kind: "regular",
        trailing: "",
        raw: null!,
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
        escapeSequence.raw = currentToken.value.substring(0, 0)
        if (escapeSequence.raw === "") {
            const error = `SyntaxError: Unexpected end of input on ${currentToken.line}:${currentToken.column}`
            return createMismatchToken(currentToken, error)
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
            start: 0,
            end: 0
        }

        if (escapeSequence.raw === "") {

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
                    const error = `SyntaxError: Unexpected end of input on ${currentToken.line}:${currentToken.column}`
                    return createMismatchToken(currentToken, error)
                }

                if (isPunctuator(currentToken, "}")) {
                    escapeSequence.end = currentToken.end
                    tokens.advance()
                    break
                }

                const isValidSequence = ["Identifier", "Integer"].includes(currentToken.type)
                    && /^[a-f0-9]+$/i.test(currentToken.value)

                if (!isValidSequence) {
                    const error = `SyntaxError: Invalid Unicode escape sequence on ${currentToken.line}:${currentToken.column}`
                    return createMismatchToken(currentToken, error)
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
                const error = `SyntaxError: Unexpected end of input on ${currentToken.line}:${currentToken.column}`
                return createMismatchToken(currentToken, error)
            }

            const isValidSequence = ["Identifier", "Integer"].includes(currentToken.type)
                && /^[a-f0-9]+$/i.test(currentToken.value)

            if (!isValidSequence) {
                const error = `SyntaxError: Invalid Unicode escape sequence on ${currentToken.line}:${currentToken.column}`
                return createMismatchToken(currentToken, error)
            }

            escapeSequence.raw += currentToken.value.substring(0, 4 - escapeSequence.raw.length)
            escapeSequence.trailing = currentToken.value.substring(4 - escapeSequence.raw.length)
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
            start: 0,
            end: 0
        }

        while (!tokens.isFinished && escapeSequence.raw.length < 2) {
            tokens.advance()
            currentToken = tokens.currentToken

            if (currentToken.type == "EOF") {
                const error = `SyntaxError: Unexpected end of input on ${currentToken.line}:${currentToken.column}`
                return createMismatchToken(currentToken, error)
            }

            const isValidSequence = ["Identifier", "Integer"].includes(currentToken.type)
                && /^[a-f0-9]+$/i.test(currentToken.value)

            if (!isValidSequence) {
                const error = `SyntaxError: Invalid Hexadecimal escape sequence on ${currentToken.line}:${currentToken.column}`
                return createMismatchToken(currentToken, error)
            }

            escapeSequence.raw += currentToken.value.substring(0, 2 - escapeSequence.raw.length)
            escapeSequence.trailing = currentToken.value.substring(2 - escapeSequence.raw.length)
        }

        if (escapeSequence.raw.length === 0)
            return createMismatchToken(currentToken)

        tokens.advance()
        escapeSequence.end = currentToken.end - escapeSequence.trailing.length
        escapeSequence.value = String.fromCodePoint(Number.parseInt(`0x${escapeSequence.raw}`))
        return escapeSequence
    }
}