import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, operatorPrecedence, skip, skipables, type Node, pickPrinter, NodePrinter, isBlockedType, blockedTypes } from "../../utility.js"
import { generateLiteral, printLiteral } from "../literal/literal.js"
import { generateTerm, printTerm } from "../term/term.js"
import { generateAssignExpr, printAssignExpr } from "./assign-expression.js"
import { generateGroupExpression, printGroupExpression } from "./group-expression.js"
import { generateInfixOperation, printInfixOperation } from "./operation.ts/infix-operation.js"
import { generateNonVerbalOperator } from "./operation.ts/non-verbal-operator.js"
import { generatePostfixOperation, printPostfixOperation } from "./operation.ts/postfix-operation.js"
// import { generatePostfixOperation } from "./operation.ts/postfix-operation.js"
import { generatePrefixOperation, printPrefixOperation } from "./operation.ts/prefix-operation.js"
import { generateVerbalOperator } from "./operation.ts/verbal-operator.js"

export function generateExpression(context: string[], tokens: TokenStream): Expression | MismatchToken {
	const expression: Expression = {
		type: "Expression",
		value: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generateAssignExpr, /* generateInfixOperation, generatePrefixOperation, generatePostfixOperation, */
		generateTerm, generateLiteral
	]

	let node: typeof expression.value | MismatchToken = null!
	for (const nodeGenerator of nodeGenerators) {
		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		node = nodeGenerator(["Expression", ...context], tokens)

		if (node.type != "MismatchToken")
			break

		if (node.errorDescription.severity <= 3) {
			tokens.cursor = initialCursor
			return node
		}
	}

	currentToken = tokens.currentToken

	if (node.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return node
	}

	expression.value = node
	expression.start = node.start
	expression.end = node.end

	expression.line = node.line
	expression.column = node.column

	return expression
}

export function printExpression(token: Expression, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	const printers = [
		printAssignExpr, printInfixOperation, printPrefixOperation, printPostfixOperation,
		printTerm, printLiteral, printGroupExpression
	] as NodePrinter[]

	const printer = pickPrinter(printers, token.value)!
	const space = " ".repeat(4)
	return "Expression\n" + space.repeat(indent) + endJoiner + printer(token.value, indent + 1)
}