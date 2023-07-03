import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, isPunctuator, PartialParse } from "../../utility.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateGroupTypeExpression(context: string[], tokens: TokenStream): GroupTypeExpression | MismatchToken {
	const groupExpression: GroupTypeExpression = {
		type: "GroupTypeExpression",
		body: null!,
		constraint: null,
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

	groupExpression.start = currentToken.start
	groupExpression.line = currentToken.line
	groupExpression.column = currentToken.column

	currentToken = skip(tokens, skipables) // skip (

	const expression: TypeExpression
		| MismatchToken
		= generateTypeExpression(["GroupTypeExpression", ...context], tokens)
	
	if (expression.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return expression
	}

	groupExpression.body = expression.body
	groupExpression.constraint = expression.constraint

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	if (!isPunctuator(currentToken, ")")) {

		const partialParse: PartialParse = {
			result: expression,
			cursor: tokens.cursor
		}

		tokens.cursor = initialCursor
		return createMismatchToken(currentToken, partialParse)
	}

	groupExpression.end = currentToken.end
	currentToken = skip(tokens, skipables) // skip )

	return groupExpression
}

export function printGroupTypeExpression(token: GroupTypeExpression, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	return "GroupTypeExpression"
}