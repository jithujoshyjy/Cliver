import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateDoCatchBlock(context: Node, tokens: TokenStream): DoCatchBlock | MismatchToken {
    const doCatchBlock: DoCatchBlock = {
        type: "DoCatchBlock",
        body: [],
        handlers: [],
        done: null,
        start: 0,
        end: 0
    }

    return doCatchBlock as DoCatchBlock
}