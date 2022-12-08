import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"
import { generateIdentifier } from "../literal/identifier.js"

export function generateTypeName(context: Node, tokens: TokenStream): TypeName | MismatchToken {
    const typeName: TypeName = {
        type: "TypeName",
        name: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const name = generateIdentifier(typeName, tokens)

    if(name.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return name
    }

    typeName.name = name

    return typeName
}