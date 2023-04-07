import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isBlockedType, isOperator, skip, skipables, type Node, withBlocked } from "../../utility.js"
import { generateDifferenceType } from "./difference-type.js"

import { generateFunctionCallType } from "./function-call-type.js"
import { generateFunctionType } from "./function-type.js"
import { generateNegateType } from "./negate-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTypeExpression } from "./type-expression.js"
import { generateTypeName } from "./type-name.js"
import { generateUnionType } from "./union-type.js"

export function generateIntersectionType(context: string[], tokens: TokenStream): IntersectionType | MismatchToken {
	const intersectionType: IntersectionType = {
		type: "IntersectionType",
		left: null!,
		right: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor
	const typeGenerators = [
		generateUnionType, generateDifferenceType, generateNegateType,
		generateFunctionType, generateFunctionCallType, generateStructureType, generateTypeName
	]

	let typeMember: TypeName | UnionType | NegateType | DifferenceType | FunctionType | FunctionCallType | StructureType | MismatchToken = null!

	for (const typeGenerator of typeGenerators) {
		if (isBlockedType(typeGenerator.name.replace("generate", "")))
			continue

		typeMember = withBlocked(["IntersectionType"],
			() => typeGenerator(["IntersectionType", ...context], tokens))
		currentToken = tokens.currentToken
		if (typeMember.type != "MismatchToken")
			break
	}

	if (typeMember.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return typeMember
	}

	intersectionType.left = typeMember
	currentToken = skip(tokens, skipables)

	if (!isOperator(currentToken, "&")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables) // skip &

	const right = withBlocked(["IntersectionType"],
		() => generateTypeExpression(["IntersectionType", ...context], tokens)) // buggy :(

	if (right.type == "MismatchToken")
		return right

	intersectionType.right = right

	return intersectionType
}