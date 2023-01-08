import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateSymbolLiteral } from "../literal/symbol-literal.js"
import { generateFunctionCall } from "./function-call.js"
import { generatePropertyAccess } from "./property-access.js"

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
        generateFunctionCall, generatePropertyAccess,
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
        currentToken = skip(tokens, _skipables)
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