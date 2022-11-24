import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateImplicitMultiplication(context: Node, tokens: TokenStream): ImplicitMultiplication | MismatchToken {
    const implicitMultiplication = {
        type: "ImplicitMultiplication",
        left: null,
        right: null,
        start: 0,
        end: 0
    }

    return implicitMultiplication as unknown as ImplicitMultiplication
}