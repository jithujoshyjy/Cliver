import { TokenStream } from "../../../../lexer/token.js"
import { type Node } from "../../../utility.js"
import { generateMetaDataInterpolation } from "../../term/meta-data-interpolation.js"
import { generateTaggedString } from "../../term/tagged-string/tagged-string.js"

export function generateInterpPattern(context: string[], tokens: TokenStream): InterpPattern | MismatchToken {
    const interpPattern: InterpPattern = {
        type: "InterpPattern",
        body: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    let body: TaggedString
        | MetaDataInterpolation
        | MismatchToken = generateTaggedString(["InterpPattern", ...context], tokens)

    if(body.type == "MismatchToken") {
        body = generateMetaDataInterpolation(["InterpPattern", ...context], tokens)
    }

    if(body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    interpPattern.start = body.start
    interpPattern.end = body.end
    interpPattern.line = body.line
    interpPattern.column = body.column
    interpPattern.body = body

    return interpPattern
}