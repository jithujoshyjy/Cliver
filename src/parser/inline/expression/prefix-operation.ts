import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generatePrefixOperation(context: Node, tokens: TokenStream): PrefixOperation | MismatchToken {
    const prefixOperation: PrefixOperation = {
        type: "PrefixOperation",
        operand: null!,
        operator: null!,
        start: 0,
        end: 0
    }

    return prefixOperation
}