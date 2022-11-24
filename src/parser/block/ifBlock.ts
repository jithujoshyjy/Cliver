import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateIfBlock(context: Node, tokens: TokenStream): IfBlock | MismatchToken {
    const ifBlock = {
        type: "IfBlock",
        alternate: null,
        body: [],
        condition: null,
        start: 0,
        end: 0
    }

    return ifBlock as unknown as IfBlock
}