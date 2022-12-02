import { TokenStream } from "../../../lexer/token.js"
import { skip, _skipables, type Node } from "../../utility"
import { generateInline } from "../inline.js"
import { generatePattern } from "./pattern.js"

export function generateCaseExpr(context: Node, tokens: TokenStream): CaseExpr | MismatchToken {
    const caseExpr: CaseExpr = {
        type: "CaseExpr",
        pattern: null!,
        body: null!,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, _skipables)
    const initialCursor = tokens.cursor
    const pattern = generatePattern(caseExpr, tokens)

    if (pattern.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return pattern
    }

    caseExpr.pattern = pattern

    currentToken = skip(tokens, _skipables)
    const body = generateInline(caseExpr, tokens)

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    caseExpr.body = body

    return caseExpr
}