import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, isPunctuator, skip, skipables, type Node } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"
import { generateMatchCaseExpr } from "./match-case-expr.js"

export function generateMatchInline(context: Node, tokens: TokenStream): MatchInline | MismatchToken {
    const matchInline: MatchInline = {
        type: "MatchInline",
        cases: [],
        head: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // match
    const initialCursor = tokens.cursor

    if (!isKeyword(currentToken, "match")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip match
    const head = generateExpression(matchInline, tokens)

    if (head.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return head
    }

    matchInline.head = head

    const captureCase = () => {
        currentToken = skip(tokens, skipables) // case
        const caseBlock = generateMatchCaseExpr(matchInline, tokens)
        return caseBlock
    }

    while (!tokens.isFinished) {
        const caseBlock = captureCase()
        if (caseBlock.type == "MismatchToken" && matchInline.cases.length == 0) {
            tokens.cursor = initialCursor
            return caseBlock
        }

        if (caseBlock.type == "MismatchToken")
            break

        matchInline.cases.push(caseBlock)
    }

    return matchInline
}