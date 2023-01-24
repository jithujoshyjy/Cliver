import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node, PartialParse } from "../../utility.js"
import { generateStringLiteral } from "../literal/string-literal.js"
import { generateSymbolLiteral, printSymbolLiteral } from "../literal/symbol-literal.js"

export function generateSymbolFragment(context: Node, tokens: TokenStream): SymbolFragment | MismatchToken {
    const symbolFragment: SymbolFragment = {
        type: "SymbolFragment",
        fragments: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    while (!tokens.isFinished) {
        const symbolLiteral = generateSymbolLiteral(symbolFragment, tokens)
        const isNotStringFragment = symbolLiteral.type == "MismatchToken"
            && symbolFragment.fragments.length == 0

        symbolFragment.end = symbolLiteral.end
        if (symbolFragment.fragments.length == 0) {
            symbolFragment.start = symbolLiteral.start
            symbolFragment.line = symbolLiteral.line
            symbolFragment.column = symbolLiteral.column
        }

        if (isNotStringFragment) {
            tokens.cursor = initialCursor
            return symbolLiteral
        }

        if (symbolLiteral.type == "MismatchToken")
            break

        symbolFragment.fragments.push(symbolLiteral)
        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken
    }

    if (symbolFragment.fragments.length < 2) {
        const partialParse: PartialParse = {
            result: symbolFragment.fragments.pop()!,
            cursor: tokens.cursor
        }

        tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    return symbolFragment
}

export function printSymbolFragment(token: SymbolFragment, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "SymbolFragment" +
        '\n' + space.repeat(indent) + endJoiner +
        token.fragments.reduce((a, c) => a + '\\' + c.text, "")
}