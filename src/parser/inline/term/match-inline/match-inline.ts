import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, type Node, _skipables, skipables, isPunctuator } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"
import { generateKeyword } from "../../keyword.js"
import { generateMatchCaseExpr } from "./match-case-expr.js"

export function generateMatchInline(context: Node, tokens: TokenStream): MatchInline | MismatchToken {
    const matchInline: MatchInline = {
        type: "MatchInline",
        cases: [],
        matchers: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const matchKeyword = generateKeyword(matchInline, tokens)

    if (matchKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return matchKeyword
    }

    if (!isKeyword(matchKeyword, "match")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    matchInline.start = matchKeyword.start
    matchInline.line = matchKeyword.line
    matchInline.column = matchKeyword.column

    let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
    const parseValue = () => {

        const expression = generateExpression(matchInline, tokens)

        lastDelim = null
        currentToken = tokens.currentToken

        return expression
    }

    const captureComma = () => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        currentToken = skip(tokens, skipables)
        return currentToken
    }

    /* while (!tokens.isFinished) { */

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        /* const resetCursorPoint = tokens.cursor
        const caseKeyword = generateKeyword(matchInline, tokens)
        tokens.cursor = resetCursorPoint

        if (isKeyword(caseKeyword, "case"))
            break */
/* 
        if (!isInitial && lastDelim == null) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        if (lastDelim?.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return lastDelim
        } */

        const value = parseValue()

        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        matchInline.matchers.push(value)

        /* lastDelim = captureComma()
        isInitial = false
    } */
    

    isInitial = true
    const captureCase = () => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const caseExpr = generateMatchCaseExpr(matchInline, tokens)

        currentToken = tokens.currentToken
        return caseExpr
    }

    while (!tokens.isFinished) {

        const caseExpr = captureCase()
        
        if (caseExpr.type == "MismatchToken" && caseExpr.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return caseExpr
        }

        if (caseExpr.type == "MismatchToken" && isInitial) {
            tokens.cursor = initialCursor
            return caseExpr
        }

        if (caseExpr.type == "MismatchToken")
            break

        isInitial = false
        matchInline.cases.push(caseExpr)
        matchInline.end = caseExpr.end
    }

    return matchInline
}

export function printMatchInline(token: MatchInline, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "MatchInline\n"
}