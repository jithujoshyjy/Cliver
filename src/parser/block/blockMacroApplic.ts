import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateBlockMacroApplication(context: Node, tokens: TokenStream): BlockMacroApplication | MismatchToken {
    const blockMacroApplication = {
        type: "BlockMacroApplication",
        caller: null,
        left: [],
        right: [],
        start: 0,
        end: 0
    }

    return blockMacroApplication as unknown as BlockMacroApplication
}