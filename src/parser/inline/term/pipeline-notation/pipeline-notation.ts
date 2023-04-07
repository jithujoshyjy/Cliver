import { TokenStream } from "../../../../lexer/token.js"
import { skip, skipables, type Node, generateOneOf, isOperator, createMismatchToken, withBlocked } from "../../../utility.js"
import { generateAsExpression } from "../../expression/as-expression.js"
import { generateExpression } from "../../expression/expression.js"
import { generateErrorPipeline } from "./error-pipeline.js"
import { generateTransformPipeline } from "./transform-pipeline.js"

export function generatePipelineNotation(context: string[], tokens: TokenStream): PipelineNotation | MismatchToken {
	const pipelineNotation: PipelineNotation = {
		type: "PipelineNotation",
		expression: null!,
		pipes: [],
		kind: "pointfree",
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generateAsExpression, generateExpression
	]

	let expression: AsExpression
		| Expression
		| MismatchToken = withBlocked(["PipelineNotation"],
			() => generateOneOf(tokens, ["PipelineNotation", ...context], nodeGenerators))

	if (expression.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return expression
	}

	pipelineNotation.start = expression.start
	pipelineNotation.line = expression.line
	pipelineNotation.column = expression.column

	pipelineNotation.expression = expression
	pipelineNotation.kind = expression.type == "AsExpression" ? "pointed" : "pointfree"

	const pipelineOperators = ["``", ".``", "??", ".??"]
	const pipelineGenerators = [
		generateTransformPipeline, generateErrorPipeline
	]

	let isInitial = true
	while (!tokens.isFinished) {

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const isPipelineOperator = pipelineOperators.some(x => isOperator(currentToken, x))

		if (isInitial && !isPipelineOperator) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}
		else if (!isPipelineOperator)
			break

		const pipeline: TransformPipeline
			| ErrorPipeline
			| MismatchToken = generateOneOf(tokens, ["PipelineNotation", ...context], pipelineGenerators)

		if (pipeline.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return pipeline
		}

		isInitial = false

		pipelineNotation.end = pipeline.end
		pipelineNotation.pipes.push(pipeline)
	}

	return pipelineNotation
}

export function printPipelineNotation(token: PipelineNotation, indent = 0) {
	const endJoiner = "└── "

	const space = " ".repeat(4)
	return "PipelineNotation"
}