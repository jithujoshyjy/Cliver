import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateTypeAssertion(context: Node, tokens: TokenStream): TypeAssertion | MismatchToken {
    const typeAssertion: TypeAssertion = {
        type: "TypeAssertion",
        left: null!,
        right: null!,
        start: 0,
        end: 0
    }

    return typeAssertion
}

