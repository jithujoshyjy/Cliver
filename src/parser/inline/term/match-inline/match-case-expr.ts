import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { generateProgram } from "../../../program.js"
import { createMismatchToken, isKeyword, isOperator, isPunctuator, skip, skipables, _skipables, type Node } from "../../../utility.js"
import { generatePattern } from "../../expression/pattern.js"

export function generateMatchCaseExpr(context: Node, tokens: TokenStream): MatchCaseExpr | MismatchToken {
    const matchCaseExpr: MatchCaseExpr = {
        type: "MatchCaseExpr",
        patterns: null!,
        body: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // case
    const initialCursor = tokens.cursor

    if (!isKeyword(currentToken, "case")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip case

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isPunctuator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    while (!tokens.isFinished) {
        const pattern = generatePattern(matchCaseExpr, tokens)
        if (pattern.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return pattern
        }

        matchCaseExpr.patterns.push(pattern)

        const comma = captureComma()
        if (comma.type == "MismatchToken" && isPunctuator(currentToken, ":")) {
            break
        }

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        currentToken = skip(tokens, skipables) // skip ,
    }

    if (!isPunctuator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip :

    const nodeGenerator = generateProgram(matchCaseExpr, tokens)

    for (let node of nodeGenerator) {

        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "case"))
            break

        if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        matchCaseExpr.body.push(node)
    }

    return matchCaseExpr
}