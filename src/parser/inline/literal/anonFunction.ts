import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateAnonFunction(context: Node, tokens: TokenStream): AnonFunction | MismatchToken {
    const anonFunction = {
        type: "AnonFunction",
        value: null,
        start: 0,
        end: 0
    }

    return anonFunction as unknown as AnonFunction
}