import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, DiagnosticMessage, isPunctuator } from "../../utility.js"
import { generateEscapeSequence } from "./escape-sequence.js"

export function generateStringLiteral(context: string[], tokens: TokenStream): StringLiteral | MismatchToken {
	const stringLiteral: StringLiteral = {
		type: "StringLiteral",
		text: "",
		kind: "inline",
		charset: "ascii",
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	if (!isPunctuator(currentToken, "\"")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	stringLiteral.start = currentToken.start
	stringLiteral.line = currentToken.line
	stringLiteral.column = currentToken.column

	let startQuoteCount = 0
	while (!tokens.isFinished && isPunctuator(currentToken, "\"")) {

		stringLiteral.end = currentToken.end
		startQuoteCount++
		tokens.advance()
		currentToken = tokens.currentToken
	}

	if (startQuoteCount == 2)
		return stringLiteral

	if (startQuoteCount > 1)
		stringLiteral.kind = "multiline"

	while (!tokens.isFinished) {
		currentToken = tokens.currentToken

		if (currentToken.type == "EOF") {
			tokens.cursor = initialCursor
			const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
			return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
		}

		if (isPunctuator(currentToken, "\"")) {
			let endQuoteCount = 0
			while (!tokens.isFinished && isPunctuator(currentToken, "\"")) {

				stringLiteral.end = currentToken.end
				endQuoteCount++
				tokens.advance()
				currentToken = tokens.currentToken

				if (endQuoteCount === startQuoteCount) break
			}

			if (endQuoteCount < startQuoteCount) {
				tokens.cursor = initialCursor
				return createMismatchToken(currentToken)
			}
			break
		}

		if (isPunctuator(currentToken, "\\")) {
			const escapeSequence = generateEscapeSequence(["StringLiteral", ...context], tokens)

			if (escapeSequence.type == "MismatchToken") {
				tokens.cursor = initialCursor
				return escapeSequence
			}

			const { value: escape, trailing } = escapeSequence
			const value = escape + trailing
			stringLiteral.text += value

			for (const _char of value)
				if (_char.codePointAt(0)! > 127)
					stringLiteral.charset = "unicode"

			continue
		}

		const { value } = currentToken
		stringLiteral.text += value

		for (const _char of value)
			if (_char.codePointAt(0)! > 127)
				stringLiteral.charset = "unicode"

		tokens.advance()
	}

	return stringLiteral
}

export function printStringLiteral(token: StringLiteral, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const quote = "\"".repeat(token.kind == "multiline" ? 3 : 1)
	const space = " ".repeat(4)
	return "StringLiteral\n" + space.repeat(indent) + endJoiner +
        token.charset + quote +
        token.text.replace(/\n/g, "\n" + space.repeat(indent + 1)) + quote
}