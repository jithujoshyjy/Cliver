import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateNonVerbalOperator(context: Node, tokens: TokenStream): NonVerbalOperator | MismatchToken {
    const nonVerbalOperator: NonVerbalOperator = {
        type: "NonVerbalOperator",
        kind: "infix",
        name: "",
        start: 0,
        end: 0
    }

    return nonVerbalOperator
}