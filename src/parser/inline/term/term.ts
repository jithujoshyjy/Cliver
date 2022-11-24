import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateTerm(context: Node, tokens: TokenStream): Term | MismatchToken {
    const term = {
        type: "Term",
        value: null,
        start: 0,
        end: 0
    }

    return term as unknown as Term
}