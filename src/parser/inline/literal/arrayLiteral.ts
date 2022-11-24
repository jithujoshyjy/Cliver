import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateArrayLiteral(context: Node, tokens: TokenStream): ArrayLiteral | MismatchToken {
    const arrayLiteral = {
        type: "ArrayLiteral",
        elements: [],
        start: 0,
        end: 0
    }

    return arrayLiteral as ArrayLiteral
}