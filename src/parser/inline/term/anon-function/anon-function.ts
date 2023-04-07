import { TokenStream } from "../../../../lexer/token.js"
import { generateOneOf } from "../../../utility.js"
import { generateBlockAnonFunction } from "./block-anon-function.js"
import { generateInlineAnonFunction } from "./inline-anon-function.js"


export function generateAnonFunction(context: string[], tokens: TokenStream): AnonFunction | MismatchToken {
	const anonFunction: AnonFunction = {
		type: "AnonFunction",
		value: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [generateInlineAnonFunction, generateBlockAnonFunction]
	let node: typeof anonFunction.value
		| MismatchToken = generateOneOf(tokens, ["AnonFunction", ...context], nodeGenerators)

	if (node.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return node
	}

	anonFunction.value = node
	anonFunction.start = node.start
	anonFunction.column = node.column
	anonFunction.line = node.line
	anonFunction.end = node.end

	return anonFunction
}

export function printAnonFunction(token: AnonFunction, indent = 0) {
	const endJoiner = "└── "

	const space = " ".repeat(4)
	return "AnonFunction"
}