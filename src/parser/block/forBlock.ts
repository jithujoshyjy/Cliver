import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateForBlock(context: Node, tokens: TokenStream): ForBlock | MismatchToken {
    const forBlock = {
        type: "ForBlock",
        body: [],
        condition: null,
        done: null,
        start: 0,
        end: 0
    }

    return forBlock as unknown as ForBlock
}