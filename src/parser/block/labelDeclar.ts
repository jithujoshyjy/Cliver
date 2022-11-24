import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateLabelDeclaration(context: Node, tokens: TokenStream): LabelDeclaration | MismatchToken {
    const labelDeclar = {
        type: "LabelDeclaration",
        body: null,
        name: null,
        start: 0,
        end: 0
    }

    return labelDeclar as unknown as LabelDeclaration
}