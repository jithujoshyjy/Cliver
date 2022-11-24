import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateIdentifier(context: Node, tokens: TokenStream): Identifier | MismatchToken {
    const identifier: Identifier = {
        type: "Identifier",
        name: "",
        start: 0,
        end: 0
    }

    return identifier as Identifier
}