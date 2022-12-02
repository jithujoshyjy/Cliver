import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateInlineMacroApplication(context: Node, tokens: TokenStream): InlineMacroApplication | MismatchToken {
    const inlineMacroApplication = {
        type: "InlineMacroApplication",
        arguments: null,
        body: null,
        caller: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return inlineMacroApplication as unknown as InlineMacroApplication
}