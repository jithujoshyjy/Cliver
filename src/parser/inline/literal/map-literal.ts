import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
import { generatePair, printPair } from "../term/pair.js"
import { generateIdentifier, printIdentifier } from "./identifier.js"

export function generateMapLiteral(context: string[], tokens: TokenStream): MapLiteral | MismatchToken {
	const mapLiteral: MapLiteral = {
		type: "MapLiteral",
		pairs: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	if (!isPunctuator(currentToken, "{")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	mapLiteral.start = currentToken.start
	mapLiteral.end = currentToken.end
	mapLiteral.line = currentToken.line
	mapLiteral.column = currentToken.column

	currentToken = skip(tokens, skipables) // skip {

	const captureComma = () => {
		const initialToken = tokens.currentToken

		if (!isPunctuator(currentToken, ",")) {
			return createMismatchToken(initialToken)
		}

		currentToken = skip(tokens, skipables)
		return initialToken
	}

	let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
	const parsePair = (isInitial: boolean) => {

		let pair: Pair
            | Identifier
            | MismatchToken = generatePair(["MapLiteral", ...context], tokens)

		if(!isInitial && pair.type == "MismatchToken")
			pair = generateIdentifier(["MapLiteral", ...context], tokens)

		currentToken = tokens.currentToken

		lastDelim = null
		return pair
	}

	while (!tokens.isFinished) {

		if (isPunctuator(currentToken, "}")) {
			mapLiteral.end = currentToken.end
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

		const pair = parsePair(isInitial)

		if (pair.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return pair
		}

		mapLiteral.pairs.push(pair)
		if (skipables.includes(currentToken))
			currentToken = skip(tokens, skipables)

		lastDelim = captureComma()
		isInitial = false
	}
    
	return mapLiteral
}

export function printMapLiteral(token: MapLiteral, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"
	const space = " ".repeat(4)
	return "MapLiteral\n" +
        token.pairs.reduce((a, c, i, arr) => a +
            space.repeat(indent) +
            (i == arr.length - 1 ? endJoiner : middleJoiner) +
            (c.type == "Identifier" ? printIdentifier(c, indent + 1) : printPair(c, indent + 1)) + "\n", "")
}