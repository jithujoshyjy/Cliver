import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, isOperator, withBlocked } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateTypeAssertion(context: string[], tokens: TokenStream): TypeAssertion | MismatchToken {
	const typeAssertion: TypeAssertion = {
		type: "TypeAssertion",
		left: null!,
		right: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const expression: Expression | MismatchToken
		= withBlocked(["AssignExpr", "TypeAssertion"],
			() => generateExpression(["TypeAssertion", ...context], tokens))

	if (expression.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return expression
	}

	typeAssertion.start = expression.start
	typeAssertion.line = expression.line
	typeAssertion.column = expression.column
	typeAssertion.left = expression

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	if (!isOperator(currentToken, "::")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables) // skip ::
	const typeExpr = generateTypeExpression(["TypeAssertion", ...context], tokens)

	if (typeExpr.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return typeExpr
	}

	typeAssertion.end = typeExpr.end
	typeAssertion.right = typeExpr

	return typeAssertion
}

export function printTypeAssertion(token: TypeAssertion, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const space = " ".repeat(4)
	return "TypeAssertion"
}