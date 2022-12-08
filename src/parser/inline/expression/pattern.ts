import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility.js"
import { generateLiteral } from "../literal/literal.js"
import { generateTerm } from "../term/term.js"

export function generatePattern(context: Node, tokens: TokenStream): Pattern | MismatchToken {
    const pattern: Pattern = {
        type: "Pattern",
        body: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    let value: Term | Literal | MismatchToken = generateTerm(context, tokens)

    // is not term
    if (value.type == "MismatchToken") {
        const literal = generateLiteral(context, tokens)
        value = literal
    }
    else { // is term
        const invalidPatternNodes = [
            "TaggedSymbol", "TaggedString", "TaggedNumber",
            "ForInline", "MatchInline", "IfInline",
            "ObjectCascadeNotation", "ExternalCallbackNotation",
            "PipelineNotation", "InlineMacroApplication",
        ]

        currentToken = tokens.currentToken
        const term = value.value as Term["value"]

        if(invalidPatternNodes.includes(term.type)) {
            const error = `SynatxError: Invalid pattern on ${currentToken.line}:${currentToken.column}`
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, error)
        }
    }

    // is not literal
    if (value.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return value
    }
    else { // is literal
        const invalidPatternNodes = [
            "DoExpr", "AnonFunction"
        ]

        currentToken = tokens.currentToken
        const literal = value.value as Literal["value"]

        if(invalidPatternNodes.includes(literal.type)) {
            tokens.cursor = initialCursor
            const error = `SynatxError: Invalid pattern on ${currentToken.line}:${currentToken.column}`
            return createMismatchToken(currentToken, error)
        }
    }

    pattern.body = value
    pattern.start = value.start
    pattern.end = value.end

    return pattern
}