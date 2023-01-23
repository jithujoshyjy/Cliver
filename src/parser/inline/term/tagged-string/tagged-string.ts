import { TokenStream } from "../../../../lexer/token.js"
import { type Node } from "../../../utility.js"
import { generateInlineTaggedString } from "./inline-tagged-string.js"
import { generateMultilineTaggedString } from "./multiline-tagged-string.js"

export function generateTaggedString(context: Node, tokens: TokenStream): TaggedString | MismatchToken {
    const taggedString: TaggedString = {
        type: "TaggedString",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let taggedStr: InlineTaggedString
        | MultilineTaggedString
        | MismatchToken = generateInlineTaggedString(taggedString, tokens)
    
    if(taggedStr.type == "MismatchToken")
        taggedStr = generateMultilineTaggedString(taggedString, tokens)

    if(taggedStr.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return taggedStr
    }

    taggedString.value = taggedStr
    taggedString.start = taggedStr.start
    taggedString.end = taggedStr.end
    taggedString.line = taggedStr.line
    taggedString.column = taggedStr.column

    return taggedString
}