import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

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