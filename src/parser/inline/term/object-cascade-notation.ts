import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"

export function generateObjectCascadeNotation(context: Node, tokens: TokenStream): ObjectCascadeNotation | MismatchToken {
    const objectCascadeNotation: ObjectCascadeNotation = {
        type: "ObjectCascadeNotation",
        body: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return objectCascadeNotation
}