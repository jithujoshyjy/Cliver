import { TokenStream } from "../../../lexer/token.js"
import { generateExpression } from "../../inline/expression/expression.js"
import { generatePattern } from "../../inline/expression/pattern/pattern.js"
import { generateTypeExpression } from "../../inline/type/type-expression.js"
import { isOperator, skip, skipables, withBlocked, type Node, createMismatchToken, DiagnosticMessage } from "../../utility.js"

export function generateVariableDeclarator(context: string[], tokens: TokenStream): VariableDeclarator | MismatchToken {
	const variableDeclarator: VariableDeclarator = {
		type: "VariableDeclarator",
		left: null!,
		right: null,
		signature: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const blockedTypes = [
		"AsExpression", "InfixPattern", "PrefixPattern",
		"PostfixPattern", "TypeAssertion", "InterpPattern"
	]

	const pattern: Pattern | MismatchToken
        = withBlocked(blockedTypes, () => generatePattern(["VariableDeclarator", ...context], tokens))
    
	if (pattern.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return pattern
	}

	if(!pattern.includesNamed) {
		const error: DiagnosticMessage = "Invalid left hand side of assignment on {0}:{1}"
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken, [error, pattern.line, pattern.column])
	}

	variableDeclarator.start = pattern.start
	variableDeclarator.line = pattern.line
	variableDeclarator.column = pattern.column
	variableDeclarator.left = pattern

	currentToken = skipables.includes(tokens.currentToken)
		? skip(tokens, skipables)
		: tokens.currentToken

	if (isOperator(currentToken, "::")) {
		currentToken = skip(tokens, skipables) // skip ::
		const typeExpr = generateTypeExpression(["VariableDeclarator", ...context], tokens)

		if (typeExpr.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return typeExpr
		}

		variableDeclarator.end = typeExpr.end
		variableDeclarator.signature = typeExpr
		currentToken = skip(tokens, skipables) // =
	}

	if (isOperator(currentToken, "=")) {

		currentToken = skip(tokens, skipables) // skip =
		const expression: Expression | MismatchToken
            = withBlocked(["AssignExpr"], () => generateExpression(["VariableDeclarator", ...context], tokens))

		if (expression.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return expression
		}

		variableDeclarator.end = expression.end
		variableDeclarator.right = expression
	}

	return variableDeclarator
}