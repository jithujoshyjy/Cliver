import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node, withBlocked } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"

export function generateErrorPipeline(context: string[], tokens: TokenStream): ErrorPipeline | MismatchToken {
	const errorPipeline: ErrorPipeline = {
		type: "ErrorPipeline",
		expression: null!,
		isIterative: false,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const isIterative = isOperator(currentToken, ".??")
	const isErrorPipe = isIterative || isOperator(currentToken, "??")

	if (!isErrorPipe) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables) // skip ?? | .??
	errorPipeline.isIterative = isIterative

	const expression = withBlocked(["PipelineNotation"],
		() => generateExpression(["ErrorPipeline", ...context], tokens))
	
	if(expression.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return expression
	}

	errorPipeline.expression = expression
	errorPipeline.start = expression.start
	errorPipeline.end = expression.end
	errorPipeline.line = expression.line
	errorPipeline.column = expression.column

	return errorPipeline
}