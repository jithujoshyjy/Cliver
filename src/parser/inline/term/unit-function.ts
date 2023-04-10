import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, isPunctuator } from "../../utility.js"
import { generateExpression, printExpression } from "../expression/expression.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateParamList } from "./param-list.js"

export function generateUnitFunction(context: string[], tokens: TokenStream): UnitFunction | MismatchToken {
	const unitFunction: UnitFunction = {
		type: "UnitFunction",
		parameters: null!,
		signature: null,
		body: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	if (isPunctuator(currentToken, "(")) {
		const paramList = generateParamList(["UnitFunction", ...context], tokens)
		if (paramList.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return paramList
		}
		
		unitFunction.parameters = paramList
		unitFunction.start = paramList.start
		unitFunction.line = paramList.line
		unitFunction.column = paramList.column
	}
	else {

		const paramList: ParamList = {
			type: "ParamList",
			positional: [],
			keyword: [],
			captured: [],
			line: 0,
			column: 0,
			start: 0,
			end: 0
		}

		const identifier: Identifier
			| MismatchToken = generateIdentifier(["UnitFunction", ...context], tokens)

		if (identifier.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return identifier
		}

		paramList.start = unitFunction.start = identifier.start
		paramList.line = unitFunction.line = identifier.line
		paramList.column = unitFunction.column = identifier.column
		paramList.end = identifier.end

		paramList.positional.push(identifier)
		unitFunction.parameters = paramList
	}

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	if (!isOperator(currentToken, "->")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables) // skip ->

	const body = generateExpression(["UnitFunction", ...context], tokens)
	if (body.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return body
	}

	unitFunction.end = body.end
	unitFunction.body = body

	return unitFunction
}

export function printUnitFunction(token: UnitFunction, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"
	const space = " ".repeat(4)

	return "UnitFunction"
}