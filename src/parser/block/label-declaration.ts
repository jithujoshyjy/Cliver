import { TokenStream } from "../../lexer/token.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { createMismatchToken, isKeyword, skip, _skipables, isBlockedType, skipables } from "../utility.js"
import { generateDoCatchBlock } from "./do-catch-block.js"
import { generateForBlock } from "./for-block.js"
import { generateIfBlock } from "./if-block.js"

export function generateLabelDeclaration(context: string[], tokens: TokenStream): LabelDeclaration | MismatchToken {
	const labelDeclar: LabelDeclaration = {
		type: "LabelDeclaration",
		body: null!,
		name: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor
	const labelName = generateIdentifier(["LabelDeclaration", ...context], tokens)

	if (labelName.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return labelName
	}

	labelDeclar.name = labelName
	labelDeclar.start = labelName.start
	labelDeclar.line = labelName.line
	labelDeclar.column = labelName.column

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	const maybeKeyword = generateKeyword(["LabelDeclaration", ...context], tokens)

	if (!isKeyword(maybeKeyword, "as")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	const nodeGenerators = [
		generateDoCatchBlock, generateForBlock, generateIfBlock
	]

	let node: typeof labelDeclar.body | MismatchToken = null!
	for (const nodeGenerator of nodeGenerators) {
		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		node = nodeGenerator(["Block", ...context], tokens)
		currentToken = tokens.currentToken

		if (node.type != "MismatchToken")
			break

		if (node.errorDescription.severity <= 3) {
			tokens.cursor = initialCursor
			return node
		}
	}

	if (node.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return node
	}

	labelDeclar.end = node.end
	labelDeclar.body = node

	return labelDeclar
}

export function printLabelDeclaration(token: LabelDeclaration, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "LabelDeclaration\n"
}