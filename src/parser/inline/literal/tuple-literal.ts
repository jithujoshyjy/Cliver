import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node, PartialParse, DiagnosticMessage, createDiagnosticMessage, DiagnosticDescription, DiagnosticDescriptionObj, isBlockedType } from "../../utility.js"
import { generateExpression, printExpression } from "../expression/expression.js"
import { generatePair, printPair } from "../term/pair.js"

export function generateTupleLiteral(context: string[], tokens: TokenStream): TupleLiteral | MismatchToken {
	const tupleLiteral: TupleLiteral = {
		type: "TupleLiteral",
		positional: [],
		keyword: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	if (!isPunctuator(currentToken, "(")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	tupleLiteral.line = currentToken.line
	tupleLiteral.column = currentToken.column
	tupleLiteral.start = currentToken.start

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

			if (isBlockedType(nodeGenerator.name.replace("generate", "")))
				continue

			value = nodeGenerator(["TupleLiteral", ...context], tokens)
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

		if (isPunctuator(currentToken, ")")) {
			tupleLiteral.end = currentToken.end
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

			tupleLiteral[argType].push(value as any)
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

	const hasValidArgs = tupleLiteral.keyword.length >= 1 ||
        tupleLiteral.positional.length > 1 ||
        tupleLiteral.positional.length == 1 &&
        lastDelim?.type != "MismatchToken"

	if (!hasValidArgs) {
		tokens.cursor = initialCursor
		let partialParse: PartialParse | undefined

		if (tupleLiteral.positional.length == 1 && lastDelim?.type != "MismatchToken")
			partialParse = {
				cursor: tokens.cursor,
				result: tupleLiteral.positional.pop()!
			}

		const diagnostics: DiagnosticDescriptionObj = {
			message: "Unexpected token '{0}' on {1}:{2}",
			args: [currentToken.type, currentToken.line, currentToken.column],
			severity: 3,
		}

		return createMismatchToken(currentToken, { partialParse, diagnostics })
	}

	return tupleLiteral
}

export function printTupleLiteral(token: TupleLiteral, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"
	const space = " ".repeat(4)
	return "TupleLiteral\n" + space.repeat(indent) +

        (!!token.positional.length && !!token.keyword.length ? middleJoiner : endJoiner) +

        (token.positional.length ? "positional\n" +
            token.positional.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printExpression(c, indent + 2) + "\n", "") : "") +

        (token.keyword.length ? (token.positional.length ? space.repeat(indent) + endJoiner : "") + "keyword\n" +
            token.keyword.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                (c.type == "Expression" ? printExpression(c, indent + 2) : printPair(c, indent + 2)) + "\n", "") : "")

}