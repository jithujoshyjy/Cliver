import { TokenStream } from "../../../../lexer/token.js"
import { isOperator, createMismatchToken, skip, skipables, withBlocked, generateOneOf } from "../../../utility.js"
import { generateAssignExpr } from "../../expression/assign-expression.js"
import { generateKeyword } from "../../keyword.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateEitherPropertyAccessOrFunctionCall } from "../term.js"

export function generateObjectOptionalCascade(context: string[], tokens: TokenStream): ObjectOptionalCascade | MismatchToken {
	const objectOptionalCascade: ObjectOptionalCascade = {
		type: "ObjectOptionalCascade",
		body: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	if (!isOperator(currentToken, "..?")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	currentToken = skip(tokens, skipables)
	const nodeGenerators = [
		generateAssignExpr, generateEitherPropertyAccessOrFunctionCall,
		generateKeyword, generateIdentifier
	]

	const body: typeof objectOptionalCascade.body
		| MismatchToken = withBlocked(["ObjectCascadeNotation"],
			() => generateOneOf(tokens, ["ObjectOptionalCascade", ...context], nodeGenerators))

	if (body.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return body
	}

	objectOptionalCascade.body = body
	objectOptionalCascade.start = body.start
	objectOptionalCascade.end = body.end
	objectOptionalCascade.line = body.line
	objectOptionalCascade.column = body.column

	return objectOptionalCascade
}