import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateNamedFunction(context: Node, tokens: TokenStream): NamedFunction | MismatchToken {
    const namedFunction = {
        type: "NamedFunction",
        body: [],
        kind: "return",
        name: null,
        params: [],
        signature: null,
        start: 0,
        end: 0
    }

    return namedFunction as unknown as NamedFunction
}