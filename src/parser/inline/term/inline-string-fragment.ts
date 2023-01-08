import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node } from "../../utility.js"
import { generateStringLiteral } from "../literal/string-literal.js"

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

    /* while(!tokens.isFinished) {
        const stringLiteral = generateStringLiteral(inlineStringFragment, tokens)
        const isNotStringFragment = stringLiteral.type == "MismatchToken"
            && inlineStringFragment.fragments.length == 0
        
        if(isNotStringFragment) {
            tokens.cursor = initialCursor
            return stringLiteral
        }

        if(stringLiteral.type == "MismatchToken")
            break

        if(stringLiteral.kind != "inline") {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        inlineStringFragment.fragments.push(stringLiteral as InlineStringLiteral)
        currentToken = skip(tokens, _skipables)
    }

    if(inlineStringFragment.fragments.length < 2) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    } */

    return inlineStringFragment
}