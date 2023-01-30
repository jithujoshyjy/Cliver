import { TokenStream } from "../../../../lexer/token.js"
import { NodePrinter, pickPrinter, type Node, PartialParse, _skipables, createMismatchToken, isOperator, isPunctuator, skip, skipables, lookAheadForFunctionCall, lookAheadForPropertyAccess, reparseIfNeeded, lookAheadForStringLiteral, lookAheadForSymbolLiteral } from "../../../utility.js"
import { printExpression } from "../../expression/expression.js"
import { generateGroupExpression, printGroupExpression } from "../../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../../literal/identifier.js"
import { printSymbolLiteral } from "../../literal/symbol-literal.js"
import { generateFunctionCall, printFunctionCall } from "../function-call.js"
import { printPair } from "../pair.js"
import { generatePropertyAccess, printPropertyAccess } from "../property-access.js"
import { generateTaggedSymbol, printTaggedSymbol } from "../tagged-symbol.js"
import { generateInlineFStringFragment, printInlineFStringFragment } from "./inline-f-string.js"
import { generateMultilineFString, printMultilineFString } from "./multiline-f-string.js"

export function generateTaggedString(context: Node, tokens: TokenStream): TaggedString | MismatchToken {
    const taggedString: TaggedString = {
        type: "TaggedString",
        tag: null!,
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0,
        meta: {}
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateFunctionCall, generatePropertyAccess, generateIdentifier, generateGroupExpression
    ] as Array<(context: Node, tokens: TokenStream) => typeof taggedString.tag | MismatchToken>

    let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | TaggedString
        | TaggedSymbol
        | MismatchToken = null!

    if (!context.meta?.resumeFrom) {
        for (let nodeGenerator of nodeGenerators) {

            tag = nodeGenerator(taggedString, tokens)
            currentToken = tokens.currentToken

            if (tag.type == "MismatchToken" && tag.partialParse) {

                const tagGenerators = [
                    generateTaggedSymbol, generateTaggedString,
                    generateFunctionCall, generatePropertyAccess
                ]
                const [child, parent] = reparseIfNeeded(taggedString, tokens, tag.partialParse, tagGenerators)

                if (parent.type == "FunctionCall")
                    parent.caller = child as any
                else if (parent.type == "PropertyAccess")
                    parent.accessor = child as any
                else if (parent.type == "TaggedSymbol")
                    parent.tag = child as any
                else if (parent.type == "TaggedString")
                    parent.tag = child as any

                tag = parent
            }

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

        taggedString.start = tag.start
        taggedString.line = tag.line
        taggedString.column = tag.column
        taggedString.tag = tag
    }

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    let taggedStr: InlineFStringFragment
        | MultilineFString
        | MismatchToken = generateMultilineFString(taggedString, tokens)

    if (taggedStr.type == "MismatchToken")
        taggedStr = generateInlineFStringFragment(taggedString, tokens)

    if (taggedStr.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return taggedStr
    }

    taggedString.value = taggedStr
    taggedString.end = taggedStr.end

    const isPropertyAccessAhead = lookAheadForPropertyAccess(tokens)
    const isFunctionCallAhead = lookAheadForFunctionCall(tokens)
    const isSymbolLiteral = lookAheadForSymbolLiteral(tokens)
    const isStringLiteral = lookAheadForStringLiteral(tokens)

    if (isPropertyAccessAhead || isFunctionCallAhead || isSymbolLiteral || isStringLiteral) {
        const partialParse: PartialParse = {
            result: taggedString,
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

    return taggedString
}

export function printInStringExpr(token: InStringExpr, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "InStringExpr" +
        '\n' + space.repeat(indent) +
        (!!token.positional.length && !!token.keyword.length ? middleJoiner : endJoiner) +

        (token.positional.length ? "positional\n" +
            token.positional.reduce((a, c, i, arr) => a + space.repeat(indent + 1) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printExpression(c, indent + 2) + '\n', '') : "") +

        (token.keyword.length ? (token.positional.length ? space.repeat(indent + 1) + endJoiner : "") + "keyword\n" +
            token.keyword.reduce((a, c, i, arr) => a + space.repeat(indent + 2) +
                (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printPair(c, indent + 3) + '\n', '') : "")
}

export function printInStringId(token: InStringId, indent = 0) {
    return printIdentifier(token.value, indent)
}

export function printTaggedString(token: TaggedString, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const tagPrinters = [
        printIdentifier, printPropertyAccess, printFunctionCall, printGroupExpression,
        printTaggedString, printTaggedSymbol
    ] as NodePrinter[]

    const fStringPrinters = [
        printInlineFStringFragment, printMultilineFString
    ] as NodePrinter[]

    const tagPrinter = pickPrinter(tagPrinters, token.tag)!
    const fStringPrinter = pickPrinter(fStringPrinters, token.value)!
    const space = ' '.repeat(4)
    return "TaggedString" +
        '\n' + space.repeat(indent) + middleJoiner + "tag" +
        '\n' + space.repeat(indent + 1) + endJoiner + tagPrinter(token.tag, indent + 1) +
        '\n' + space.repeat(indent) + endJoiner + fStringPrinter(token.value, indent + 1)
}