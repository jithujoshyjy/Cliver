import { TokenStream } from "../../../../lexer/token.js"
import { type Node } from "../../../utility"

export function generatePostfixOperation(context: Node, tokens: TokenStream): PostfixOperation | MismatchToken {
    const postfixOperation: PostfixOperation = {
        type: "PostfixOperation",
        operand: null!,
        operator: null!,
        start: 0,
        end: 0
    }

    return postfixOperation
}