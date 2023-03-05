import { TokenStream } from "../../../../lexer/token.js"
import { type Node } from "../../../utility.js"
import { generateBlockAnonFunction } from "./block-anon-function.js"
import { generateInlineAnonFunction } from "./inline-anon-function.js"


export function generateAnonFunction(context: string[], tokens: TokenStream): AnonFunction | MismatchToken {
    const anonFunction: AnonFunction = {
        type: "AnonFunction",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let value: typeof anonFunction.value | MismatchToken = generateInlineAnonFunction(["AnonFunction", ...context], tokens)
    if(value.type == "MismatchToken") {
        value = generateBlockAnonFunction(["AnonFunction", ...context], tokens)
    }

    if(value.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return value
    }

    anonFunction.value = value

    return anonFunction
}