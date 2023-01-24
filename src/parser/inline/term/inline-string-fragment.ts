import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node, PartialParse } from "../../utility.js"
import { generateStringLiteral, printStringLiteral } from "../literal/string-literal.js"

export function generateInlineStringFragment(context: Node, tokens: TokenStream): InlineStringFragment | MismatchToken {
    const inlineStringFragment: InlineStringFragment = {
        type: "InlineStringFragment",
        fragments: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    while (!tokens.isFinished) {
        const stringLiteral = generateStringLiteral(inlineStringFragment, tokens)
        const isNotStringFragment = stringLiteral.type == "MismatchToken"
            && inlineStringFragment.fragments.length == 0

        if (isNotStringFragment) {
            tokens.cursor = initialCursor
            return stringLiteral
        }

        if (stringLiteral.type == "MismatchToken")
            break

        if (stringLiteral.kind != "inline") {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        inlineStringFragment.fragments.push(stringLiteral as InlineStringLiteral)
        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken
    }

    if (inlineStringFragment.fragments.length < 2) {
        const partialParse: PartialParse = {
            result: inlineStringFragment.fragments.pop()!,
            cursor: tokens.cursor
        }
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    return inlineStringFragment
}

export function printInlineStringFragment(token: InlineStringFragment, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "InlineStringFragment" +
        token.fragments.reduce((a, c, i, arr) =>
            a + '\n' + space.repeat(indent) +
            (i < arr.length - 1 ? middleJoiner : endJoiner) +
            printStringLiteral(c, indent + 1), "")
}