import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateInterpPattern(context: Node, tokens: TokenStream): InterpPattern | MismatchToken {
    const interpPattern: InterpPattern = {
        type: "InterpPattern",
        body: null!,
        start: 0,
        end: 0
    }

    return interpPattern
}