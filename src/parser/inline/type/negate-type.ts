import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, _skipables, withBlocked } from "../../utility.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateNegateType(context: string[], tokens: TokenStream): NegateType | MismatchToken {
	const negateType: NegateType = {
		type: "NegateType",
		operand: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	if (!isOperator(currentToken, "!")) {
		tokens.cursor = initialCursor
		return createMismatchToken(currentToken)
	}

	negateType.start = currentToken.start
	negateType.line = currentToken.line
	negateType.column = currentToken.column
	currentToken = skip(tokens, _skipables) // skip !
	
	const typeMember = withBlocked(["NegateType"],
		() => generateTypeExpression(["NegateType", ...context], tokens))

	if (typeMember.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return typeMember
	}

	negateType.end = typeMember.end
	negateType.operand = typeMember

	return negateType
}