import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, generateOneOf, isOperator, skip, skipables, withBlocked } from "../../../utility.js"
import { generateAssignExpr } from "../../expression/assign-expression.js"
import { generateKeyword } from "../../keyword.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateEitherPropertyAccessOrFunctionCall } from "../term.js"

export function generateObjectRegularCascade(context: string[], tokens: TokenStream): ObjectRegularCascade | MismatchToken {
	const objectRegularCascade: ObjectRegularCascade = {
		type: "ObjectRegularCascade",
		body: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	if (!isOperator(currentToken, "..")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables)
	const nodeGenerators = [
		generateAssignExpr, generateEitherPropertyAccessOrFunctionCall,
		generateKeyword, generateIdentifier
	]

	const body: typeof objectRegularCascade.body
		| MismatchToken = withBlocked(["ObjectCascadeNotation"],
			() => generateOneOf(tokens, ["ObjectRegularCascade", ...context], nodeGenerators))

	if (body.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return body
	}

	objectRegularCascade.body = body
	objectRegularCascade.start = body.start
	objectRegularCascade.end = body.end
	objectRegularCascade.line = body.line
	objectRegularCascade.column = body.column

	return objectRegularCascade
}