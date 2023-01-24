import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node, NodePrinter, pickPrinter } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateSymbolLiteral, printSymbolLiteral } from "../literal/symbol-literal.js"
import { generateFunctionCall, printFunctionCall } from "./function-call.js"
import { generatePropertyAccess, printPropertyAccess } from "./property-access.js"

export function generateTaggedSymbol(context: Node, tokens: TokenStream): TaggedSymbol | MismatchToken {
    const taggedSymbol: TaggedSymbol = {
        type: "TaggedSymbol",
        fragments: [],
        tag: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        /* generateFunctionCall, generatePropertyAccess, */
        generateIdentifier, generateGroupExpression
    ]

    let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        tag = nodeGenerator(taggedSymbol, tokens)
        currentToken = tokens.currentToken
        if (tag.type != "MismatchToken")
            break

        if (tag.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return tag
        }
    }

    if (tag.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return tag
    }

    taggedSymbol.tag = tag

    while (!tokens.isFinished) {

        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken

        const fragment = generateSymbolLiteral(taggedSymbol, tokens)

        if (fragment.type == "MismatchToken" && taggedSymbol.fragments.length == 0) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        if (fragment.type == "MismatchToken")
            break

        taggedSymbol.fragments.push(fragment)
    }

    if (taggedSymbol.fragments.length < 1) {
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken)
    }

    return taggedSymbol
}

export function printTaggedSymbol(token: TaggedSymbol, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printIdentifier, printPropertyAccess, printFunctionCall, printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.tag)!
    const space = ' '.repeat(4)
    return "TaggedSymbol" +
        '\n' + space.repeat(indent) + middleJoiner + "tag\n" +
        + space.repeat(indent + 1) + endJoiner + printer(token.tag, indent+2) +
        (token.fragments.length
            ? '\n' + space.repeat(indent) + endJoiner +
            "fragments" +
            token.fragments.reduce((a, c, i, arr) =>
                a + '\n' + space.repeat(indent + 1) +
                (i < arr.length - 1 ? middleJoiner : endJoiner) + printSymbolLiteral(c, indent+2), "")
            : "")
}