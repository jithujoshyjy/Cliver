/* eslint-disable no-self-assign */
import { TokenStream } from "../../../lexer/token.js"
import { printBlock } from "../../block/block.js"
import { skip, _skipables, type Node, isKeyword, createMismatchToken } from "../../utility.js"
import { generateKeyword } from "../keyword.js"
import { printExpression } from "./expression.js"
import { generatePattern, printPattern } from "./pattern/pattern.js"

export function generateCaseExpr(context: string[], tokens: TokenStream): CaseExpr | MismatchToken {
	const caseExpr: CaseExpr = {
		type: "CaseExpr",
		pattern: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const maybeKeyword = generateKeyword(["CaseExpr", ...context], tokens)
	if (!isKeyword(maybeKeyword, "case")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	maybeKeyword.start = maybeKeyword.start
	maybeKeyword.line = maybeKeyword.line
	maybeKeyword.column = maybeKeyword.column

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	const pattern = generatePattern(["CaseExpr", ...context], tokens)
	if (pattern.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return pattern
	}

	caseExpr.pattern = pattern
	caseExpr.end = pattern.end

	return caseExpr
}

export function printCaseExpr(token: CaseExpr, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "CaseExpr" +
        "\n" + space.repeat(indent) + middleJoiner + "pattern\n" +
        "\n" + space.repeat(indent + 1) + (token.body ? middleJoiner : endJoiner) +
        printPattern(token.pattern, indent + 2) +
        (token.body
        	? "\n" + space.repeat(indent) + endJoiner + "body\n" +
            "\n" + space.repeat(indent + 1) + endJoiner +
            (token.body.type == "Block"
            	? printBlock(token.body, indent + 2)
            	: printExpression(token.body, indent + 2))
        	: "")
}