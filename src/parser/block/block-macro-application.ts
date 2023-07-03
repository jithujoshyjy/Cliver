import { TokenStream } from "../../lexer/token.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { createMismatchToken, skip, _skipables, isOperator } from "../utility.js"

export function generateBlockMacroApplication(context: string[], tokens: TokenStream): BlockMacroApplication | MismatchToken {
	const blockMacroApplication: BlockMacroApplication = {
		type: "BlockMacroApplication",
		caller: null!,
		left: [],
		right: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	if (!isOperator(currentToken, "@@")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	blockMacroApplication.start = currentToken.start
	blockMacroApplication.line = currentToken.line
	blockMacroApplication.column = currentToken.column

	currentToken = skip(tokens, _skipables)
	let caller = generateIdentifier(["BlockMacroApplication", ...context], tokens)

	if (caller.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return caller
	}

	blockMacroApplication.caller = caller
	return blockMacroApplication
}

export function printBlockMacroApplication(token: BlockMacroApplication, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "BlockMacroApplication"
}