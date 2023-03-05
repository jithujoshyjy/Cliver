import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"

export function generateObjectCascadeNotation(context: string[], tokens: TokenStream): ObjectCascadeNotation | MismatchToken {
    const objectCascadeNotation: ObjectCascadeNotation = {
        type: "ObjectCascadeNotation",
        body: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    return objectCascadeNotation
}