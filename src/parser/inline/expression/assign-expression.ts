import { TokenStream } from "../../../lexer/token.js"
import { generateVariableDeclarator } from "../../block/variable-declaration/variable-declarator.js"
import { createMismatchToken, type Node } from "../../utility.js"

export function generateAssignExpr(context: string[], tokens: TokenStream): AssignExpr | MismatchToken {
	const assignExpr: AssignExpr = {
		type: "AssignExpr",
		left: null!,
		right: null!,
		signature: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const declarator = generateVariableDeclarator(["AssignExpr", ...context], tokens)

	if (declarator.type == "MismatchToken") {
		if (declarator.errorDescription.code == "CLE0010")
			declarator.errorDescription.severity = 5
        
		tokens.cursor = initialCursor
		return declarator
	}

	currentToken = tokens.currentToken
	if (declarator.right == null) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	assignExpr.left = declarator.left
	assignExpr.right = declarator.right
	assignExpr.signature = declarator.signature

	return assignExpr
}

export function printAssignExpr(token: Expression, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "AssignExpr\n"
}