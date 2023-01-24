import { TokenStream } from "../../../../lexer/token.js"
import { NodePrinter, pickPrinter, type Node } from "../../../utility.js"
import { printSymbolLiteral } from "../../literal/symbol-literal.js"
import { generateInlineTaggedString, printInlineTaggedString } from "./inline-tagged-string.js"
import { generateMultilineTaggedString, printMultilineTaggedString } from "./multiline-tagged-string.js"

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
        | MismatchToken = generateMultilineTaggedString(taggedString, tokens)

    if (taggedStr.type == "MismatchToken")
        taggedStr = generateInlineTaggedString(taggedString, tokens)

    if (taggedStr.type == "MismatchToken") {
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

export function printTaggedString(token: TaggedString, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printInlineTaggedString, printMultilineTaggedString
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!
    const space = ' '.repeat(4)
    return "TaggedString" +
        '\n' + space.repeat(indent) + endJoiner + printer(token.value, indent + 1)
}