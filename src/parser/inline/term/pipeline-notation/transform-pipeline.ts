import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node, withBlocked } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"

export function generateTransformPipeline(context: string[], tokens: TokenStream): TransformPipeline | MismatchToken {
	const transformPipeline: TransformPipeline = {
		type: "TransformPipeline",
		expression: null!,
		isIterative: false,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const isIterative = isOperator(currentToken, ".``")
	const isTransformPipe = isIterative || isOperator(currentToken, "``")

	if (!isTransformPipe) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables) // skip `` | .``
	transformPipeline.isIterative = isIterative

	const expression = withBlocked(["PipelineNotation"],
		() => generateExpression(["TransformPipeline", ...context], tokens))
	
	if(expression.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return expression
	}

	transformPipeline.expression = expression
	transformPipeline.start = expression.start
	transformPipeline.end = expression.end
	transformPipeline.line = expression.line
	transformPipeline.column = expression.column

	return transformPipeline
}