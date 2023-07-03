import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, isBlockedType } from "../../utility.js"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateGroupTypeExpression } from "./group-type-expression.js"
import { generateNegateType } from "./negate-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTupleType } from "./tuple-type.js"
import { generateTypeExpression } from "./type-expression.js"
import { generateTypeName } from "./type-name.js"

export function generatePairType(context: string[], tokens: TokenStream): PairType | MismatchToken {
	const pair: PairType = {
		type: "PairType",
		key: null!,
		value: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor

	const nodeGenerators = [
		generateTypeName, generateNegateType, generateFunctionCallType,
		generateTupleType, generateGroupTypeExpression, generateStructureType
	]

	let key: TypeName
		| NegateType
		| FunctionCallType
		| TupleType
		| GroupTypeExpression
		| StructureType
		| MismatchToken = null!

	for (const nodeGenerator of nodeGenerators) {
		if (isBlockedType(nodeGenerator.name.replace("generate", "")))
			continue

		key = nodeGenerator(["Pair", ...context], tokens)
		currentToken = tokens.currentToken
		if (key.type != "MismatchToken")
			break

		if (key.errorDescription.severity <= 3) {
			tokens.cursor = initialCursor
			return key
		}
	}

	if (key.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return key
	}

	pair.key = key
	pair.start = key.start
	pair.line = key.line
	pair.column = key.column

	currentToken = _skipables.includes(tokens.currentToken)
		? skip(tokens, _skipables)
		: tokens.currentToken

	if (!isOperator(currentToken, ":")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables) // skip :
	const value = generateTypeExpression(["Pair", ...context], tokens)

	if (value.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return value
	}

	pair.end = value.end
	pair.value = value
	return pair
}

export function printTypePair(token: Pair, indent = 0) {
	const middleJoiner = "├── "
	const endJoiner = "└── "
	const trailJoiner = "│\t"

	return "PairType"
}