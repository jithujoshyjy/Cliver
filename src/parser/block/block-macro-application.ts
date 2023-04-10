import { TokenStream } from "../../lexer/token.js"
import { generateNonVerbalOperator } from "../inline/expression/operation.ts/non-verbal-operator.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { createMismatchToken, skip, _skipables } from "../utility.js"

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

	const maybeOperator = generateNonVerbalOperator(["BlockMacroApplication", ...context], tokens)
	if (maybeOperator.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return maybeOperator
	}

	if (maybeOperator.name != "@@") {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	blockMacroApplication.start = currentToken.start
	blockMacroApplication.line = currentToken.line
	blockMacroApplication.column = currentToken.column

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

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