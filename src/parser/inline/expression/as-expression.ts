import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, _skipables, type Node, PartialParse, pickPrinter, NodePrinter, withBlocked } from "../../utility.js"
import { generateKeyword } from "../keyword.js"
import { generateExpression, printExpression } from "./expression.js"
import { generatePattern, printPattern } from "./pattern/pattern.js"

export function generateAsExpression(context: string[], tokens: TokenStream): AsExpression | MismatchToken {
	const asExpression: AsExpression = {
		type: "AsExpression",
		left: null!,
		right: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const left: Expression | MismatchToken
		= withBlocked(["AssignExpr"], () => generateExpression(["AsExpression", ...context], tokens))

	if (left.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return left
	}

	asExpression.left = left
	asExpression.start = left.start
	asExpression.line = left.line
	asExpression.column = left.column

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	const asKeyword = generateKeyword(["AsExpression", ...context], tokens)
	if (asKeyword.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return asKeyword
	}

	if (!isKeyword(asKeyword, "as")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	let right: Pattern
		| MismatchToken = null!

	right = withBlocked(["AsExpression"],
		() => generatePattern(["AsExpression", ...context], tokens))

	if (right.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return right
	}

	asExpression.right = right
	asExpression.end = right.end

	return asExpression
}

export function printAsExpression(token: AsExpression, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const printers = [printPattern, printExpression] as NodePrinter[]
	const printer = pickPrinter(printers, token.right)!

	const space = " ".repeat(4)
	return "AsExpression" +
		"\n" + space.repeat(indent) + middleJoiner + "left" +
		"\n" + space.repeat(indent + 1) + endJoiner +
		printExpression(token.left, indent + 2) +
		"\n" + space.repeat(indent) + endJoiner + "body" +
		"\n" + space.repeat(indent + 1) + endJoiner +
		printer(token.right, indent + 1)
}