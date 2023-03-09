import { TokenStream } from "../../../lexer/token.js"
import { isBlockedType, isKeyword, skip, skipables, type Node } from "../../utility.js"
import { generateDifferenceType } from "./difference-type.js"
import { generateFunctionCallType } from "./function-call-type.js"
import { generateFunctionType } from "./function-type.js"
import { generateIntersectionType } from "./intersection-type.js"
import { generateNegateType } from "./negate-type.js"
import { generateStructureType } from "./structure-type.js"
import { generateTupleType } from "./tuple-type.js"
import { generateTypeConstraint } from "./type-constraint.js"
import { generateTypeName } from "./type-name.js"
import { generateUnionType } from "./union-type.js"

export function generateTypeExpression(context: string[], tokens: TokenStream): TypeExpression | MismatchToken {
	const typeExpression: TypeExpression = {
		type: "TypeExpression",
		body: null!,
		constraint: null,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	let currentToken = tokens.currentToken
	const initialCursor = tokens.cursor
	const typeGenerators = [
		generateIntersectionType, generateUnionType, generateDifferenceType,
		generateNegateType, generateFunctionType, generateFunctionCallType, generateTupleType, generateStructureType, generateTypeName
	]

	let typeMember: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | TupleType | GroupTypeExpression | StructureType | MismatchToken = null!

	for (const typeGenerator of typeGenerators) {
		if (isBlockedType(typeGenerator.name.replace("generate", "")))
			continue
		typeMember = typeGenerator(["TypeExpression", ...context], tokens)
		if (typeMember.type != "MismatchToken")
			break
	}

	if (typeMember.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return typeMember
	}

	typeExpression.body = typeMember
	currentToken = skip(tokens, skipables)

	if (isKeyword(currentToken, "where")) {
		currentToken = skip(tokens, skipables) // skip where
		const typeConstraint = generateTypeConstraint(["TypeExpression", ...context], tokens)

		if (typeConstraint.type == "MismatchToken") {
			tokens.cursor = initialCursor
			return typeConstraint
		}

		typeExpression.constraint = typeConstraint
	}

	return typeExpression
}

/*
type Maybe(a) =
    | Just(value :: a)
    ..unwrap :: () -> a

    | None
    ..unwrap :: () -> _

    | Self
    ..propertyX :: Int
    ..propertyY :: Int

val Just
    ..propertyX = valueX
    ..propertyY = valueY

val None
    ..propertyX = valueX
    ..propertyY = valueY

fun Just.unwrap<instance>()
    val (value, ) = instance.args
    value
end

fun None.unwrap<instance>()
    throw Error()
end
*/