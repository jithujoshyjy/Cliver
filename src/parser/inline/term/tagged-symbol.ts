import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node, NodePrinter, pickPrinter, PartialParse, isOperator, isPunctuator, skipables, lookAheadForFunctionCall, lookAheadForPropertyAccess, reparseIfNeeded, lookAheadForSymbolLiteral, lookAheadForStringLiteral } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateSymbolLiteral, printSymbolLiteral } from "../literal/symbol-literal.js"
import { generateFunctionCall, printFunctionCall } from "./function-call.js"
import { generatePropertyAccess, printPropertyAccess } from "./property-access.js"
import { generateTaggedString, printTaggedString } from "./tagged-string/tagged-string.js"

export function generateTaggedSymbol(context: Node, tokens: TokenStream): TaggedSymbol | MismatchToken {
    const taggedSymbol: TaggedSymbol = {
        type: "TaggedSymbol",
        fragments: [],
        tag: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0,
        meta: {}
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const partialParsables = [
        "FunctionCall", "PropertyAccess",
        "TaggedSymbol", "TaggedString"
    ]

    const nodeGenerators = [
        /* generateFunctionCall, generatePropertyAccess, */ generateIdentifier, generateGroupExpression
    ] as Array<(context: Node, tokens: TokenStream) => typeof taggedSymbol.tag | MismatchToken>

    let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | TaggedSymbol
        | TaggedString
        | MismatchToken = null!

    if (!context.meta?.resumeFrom) {
        for (let nodeGenerator of nodeGenerators) {

            tag = nodeGenerator(taggedSymbol, tokens)
            currentToken = tokens.currentToken

            if (tag.type != "MismatchToken")
                break

            if (tag.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return tag
            }

            if (tag.type == "MismatchToken" && partialParsables.includes(tag.partialParse?.result?.type)) {

                const tagGenerators = [
                    generateTaggedSymbol, generateTaggedString,
                    generateFunctionCall, generatePropertyAccess
                ]
                
                const [child, parent] = reparseIfNeeded(taggedSymbol, tokens, tag.partialParse!, tagGenerators)
                currentToken = tokens.currentToken

                if (parent.type == "FunctionCall")
                    parent.caller = child as any
                else if (parent.type == "PropertyAccess")
                    parent.accessor = child as any
                else if (parent.type == "TaggedSymbol")
                    parent.tag = child as any
                else if (parent.type == "TaggedString")
                    parent.tag = child as any
                else {
                    tokens.cursor = initialCursor
                    return tag
                }

                tag = parent
            }
        }

        if (tag.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return tag
        }

        taggedSymbol.start = tag.start
        taggedSymbol.line = tag.line
        taggedSymbol.column = tag.column
        taggedSymbol.tag = tag
    }

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

    const isPropertyAccessAhead = lookAheadForPropertyAccess(tokens)
    const isFunctionCallAhead = lookAheadForFunctionCall(tokens)
    const isSymbolLiteral = lookAheadForSymbolLiteral(tokens)
    const isStringLiteral = lookAheadForStringLiteral(tokens)

    if (isPropertyAccessAhead || isFunctionCallAhead || isSymbolLiteral || isStringLiteral) {
        const partialParse: PartialParse = {
            result: taggedSymbol,
            cursor: tokens.cursor,
            meta: {
                parentType: isPropertyAccessAhead
                    ? "PropertyAccess"
                    : isFunctionCallAhead
                        ? "FunctionCall"
                        : isSymbolLiteral
                            ? "TaggedSymbol"
                            : "TaggedString"
            }
        }

        // tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    return taggedSymbol
}

export function printTaggedSymbol(token: TaggedSymbol, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printIdentifier, printPropertyAccess, printFunctionCall, printGroupExpression,
        printTaggedString, printTaggedSymbol
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.tag)!
    const space = ' '.repeat(4)
    return "TaggedSymbol" +
        '\n' + space.repeat(indent) + middleJoiner + "tag" +
        '\n' + space.repeat(indent + 1) + endJoiner + printer(token.tag, indent + 2) +
        (token.fragments.length
            ? '\n' + space.repeat(indent) + endJoiner +
            "fragments" +
            token.fragments.reduce((a, c, i, arr) =>
                a + '\n' + space.repeat(indent + 1) +
                (i < arr.length - 1 ? middleJoiner : endJoiner) + printSymbolLiteral(c, indent + 2), "")
            : "")
}