import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"
import { generateIdentifier } from "../literal/identifier.js"

export function generateTypeName(context: string[], tokens: TokenStream): TypeName | MismatchToken {
	const typeName: TypeName = {
		type: "TypeName",
		name: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	const currentToken = tokens.currentToken

	const name = generateIdentifier(["TypeName", ...context], tokens)

	if(name.type == "MismatchToken") {
		tokens.cursor = initialCursor
		return name
	}

	typeName.name = name

	return typeName
}