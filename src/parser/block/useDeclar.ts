import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateUseDeclaration(context: Node, tokens: TokenStream): UseDeclaration | MismatchToken {
    const useDeclar: UseDeclaration = {
        type: "UseDeclaration",
        rules: [],
        start: 0,
        end: 0
    }

    return useDeclar as UseDeclaration
}