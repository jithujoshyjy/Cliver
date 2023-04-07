import { TokenStream } from "../../../../lexer/token.js"
import { withBlocked, skipables, skip, _skipables, createMismatchToken, isOperator, generateOneOf } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTerm } from "../term.js"
import { generateObjectOptionalCascade } from "./object-optional-cascade.js"
import { generateObjectRegularCascade } from "./object-regular-cascade.js"

export function generateObjectCascadeNotation(context: string[], tokens: TokenStream): ObjectCascadeNotation | MismatchToken {
	const objectCascadeNotation: ObjectCascadeNotation = {
		type: "ObjectCascadeNotation",
		object: null!,
		body: [],
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	const objectGenerators = [
		generateTerm, generateLiteral
	]
	
	const object: Term
		| Literal
		| MismatchToken = withBlocked(["ObjectCascadeNotation"],
			() => generateOneOf(tokens, ["ObjectCascadeNotation", ...context], objectGenerators))

	if (object.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return object
	}

	objectCascadeNotation.start = object.start
	objectCascadeNotation.line = object.line
	objectCascadeNotation.column = object.column
	objectCascadeNotation.object = object

	const nodeGenerators = [generateObjectRegularCascade, generateObjectOptionalCascade]

	let isInitial = true
	while (!tokens.isFinished) {

		currentToken = skipables.includes(tokens.currentToken)
			? skip(tokens, skipables)
			: tokens.currentToken

		const isOptionalCascadeOperator = isOperator(currentToken, "..?")
		const isCascadeOperator = isOptionalCascadeOperator || isOperator(currentToken, "..")

		if (!isCascadeOperator && !isInitial)
			break

		if (!isCascadeOperator) {
			tokens.cursor = initialCursor
			return createMismatchToken(currentToken)
		}

		let cascade: ObjectRegularCascade
			| ObjectOptionalCascade
			| MismatchToken = generateOneOf(tokens, ["ObjectCascadeNotation", ...context], nodeGenerators)

		if (cascade.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return cascade
		}

		objectCascadeNotation.end = cascade.end
		objectCascadeNotation.body.push(cascade)

		isInitial = false
	}

	return objectCascadeNotation
}

export function printObjectCascadeNotation(token: ObjectCascadeNotation, indent = 0) {
	const endJoiner = "└── "
	const space = " ".repeat(4)
	return "ObjectCascadeNotation"
}