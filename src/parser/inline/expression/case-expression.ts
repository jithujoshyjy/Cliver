import { TokenStream } from "../../../lexer/token.js"
import { skip, _skipables, type Node } from "../../utility.js"
import { generatePattern } from "./pattern/pattern.js"

export function generateCaseExpr(context: Node, tokens: TokenStream): CaseExpr | MismatchToken {
    const caseExpr: CaseExpr = {
        type: "CaseExpr",
        pattern: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, _skipables) // skip case
    const initialCursor = tokens.cursor

    const pattern = generatePattern(caseExpr, tokens)
    if (pattern.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return pattern
    }

    caseExpr.pattern = pattern

    return caseExpr
}