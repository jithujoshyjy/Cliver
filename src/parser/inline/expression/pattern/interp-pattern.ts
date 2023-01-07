import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, type Node } from "../../../utility.js"
import { generateMetaDataInterpolation } from "../../term/meta-data-interpolation.js"
import { generateTaggedString } from "../../term/tagged-string/tagged-string.js"

export function generateInterpPattern(context: Node, tokens: TokenStream): InterpPattern | MismatchToken {
    const interpPattern: InterpPattern = {
        type: "InterpPattern",
        body: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    let body: TaggedString
        | MetaDataInterpolation
        | MismatchToken = generateTaggedString(interpPattern, tokens)

    if(body.type == "MismatchToken") {
        body = generateMetaDataInterpolation(interpPattern, tokens)
    }

    if(body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    interpPattern.body = body

    return interpPattern
}