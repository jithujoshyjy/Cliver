import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateBlock(context: Node, tokens: TokenStream): Block | MismatchToken {
    const block = {
        type: "Block",
        value: null,
        start: 0,
        end: 0
    }

    return block as unknown as Block
}