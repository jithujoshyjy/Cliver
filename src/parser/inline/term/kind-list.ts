import { TokenStream } from "../../../lexer/token.js"
import { isPunctuator, createMismatchToken, skip, skipables, isOperator } from "../../utility.js"
import { generateIdentifier } from "../literal/identifier.js"

export function generateKindList(context: string[], tokens: TokenStream): KindList | MismatchToken {
	const kindList: KindList = {
		type: "KindList",
		kinds: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	if (!isOperator(currentToken, "<")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	kindList.start = currentToken.start
	kindList.line = currentToken.line
	kindList.column = currentToken.column

	currentToken = skip(tokens, skipables)

	let lastDelim: LexicalToken | MismatchToken | null = null, isInitial = true

	const captureComma = () => {
		const initialToken = tokens.currentToken

		if (!isPunctuator(initialToken, ",")) {
			return createMismatchToken(initialToken)
		}

		currentToken = skip(tokens, skipables)
		return initialToken
	}

	while (!tokens.isFinished) {

		if (isOperator(currentToken, ">")) {
			kindList.end = currentToken.end
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

		const kind = generateIdentifier(["KindList", ...context], tokens)

		if (kind.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return kind
		}

		kindList.kinds.push(kind)

		currentToken = skipables.includes(currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		lastDelim = captureComma()
		isInitial = false
	}

	return kindList
}

export function printKindList(token: KindList, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"
	const space = " ".repeat(4)

	return "KindList"
}