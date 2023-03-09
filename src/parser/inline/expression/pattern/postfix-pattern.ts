/* eslint-disable no-self-assign */
import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, skip, type Node, _skipables, operatorPrecedence, isBlockedType } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateNonVerbalOperator } from "../operation.ts/non-verbal-operator.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"

export function generatePostfixPattern(context: string[], tokens: TokenStream): PostfixPattern | MismatchToken {
	const postfixPattern: PostfixPattern = {
		type: "PostfixPattern",
		operand: null!,
		operator: null!,
		includesNamed: false,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const operandGenerators = [
		generateBracePattern, generateBracketPattern, generateParenPattern,
		generateInterpPattern, generateLiteral
	]

	let operand: Literal
        | BracePattern
        | BracketPattern
        | ParenPattern
        | InterpPattern
        | MismatchToken = null!

	for (const operandGenerator of operandGenerators) {
		if (isBlockedType(operandGenerator.name.replace("generate", "")))
			continue

		operand = operandGenerator(["PostfixPattern", ...context], tokens)
		currentToken = tokens.currentToken

		if (operand.type != "MismatchToken") {
			break
		}

		if (operand.errorDescription.severity <= 3) {
			tokens.cursor = initialCursor
			return operand
		}
	}

	if (operand.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return operand
	}

	postfixPattern.operand = operand
	postfixPattern.start = operand.start
	postfixPattern.line = operand.line
	postfixPattern.column = operand.column

	postfixPattern.includesNamed =
        operand.type == "Literal" && operand.value.type == "Identifier" ||
        operand.type != "Literal" && operand.includesNamed

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	const _operator = generateNonVerbalOperator(["PostfixPattern", ...context], tokens)

	if (_operator.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return _operator
	}

	const validPostfixOp = [
		"?",
	]

	currentToken = tokens.currentToken
	if (!validPostfixOp.includes(_operator.name)) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	const getPrecidence = (op: NonVerbalOperator): number => {
		const isVerbalOperator = /^\p{Letter}+$/gu.test(op.name as string)
		const defaultPreced = isVerbalOperator ? 2 : 10
		switch (op.type) {
		case "NonVerbalOperator":
			return operatorPrecedence.postfix[op.name] ?? defaultPreced
		}
	}

	_operator.kind = "prefix"
	_operator.precedence = getPrecidence(_operator)
	_operator.end = _operator.end

	postfixPattern.operator = _operator

	return postfixPattern
}