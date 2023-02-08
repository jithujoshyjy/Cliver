import { TokenStream } from "../../../../lexer/token.js"
import { generateBlock } from "../../../block/block.js"
import { createMismatchToken, isKeyword, isOperator, isPunctuator, skip, skipables, _skipables, type Node } from "../../../utility.js"
import { generatePattern } from "../../expression/pattern/pattern.js"
import { generateInline } from "../../inline.js"
import { generateKeyword } from "../../keyword.js"

export function generateMatchCaseExpr(context: Node, tokens: TokenStream): MatchCaseExpr | MismatchToken {
    const matchCaseExpr: MatchCaseExpr = {
        type: "MatchCaseExpr",
        patterns: [],
        body: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const caseKeyword = generateKeyword(matchCaseExpr, tokens)

    if (caseKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caseKeyword
    }

    if (!isKeyword(caseKeyword, "case")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    matchCaseExpr.start = caseKeyword.start
    matchCaseExpr.line = caseKeyword.line
    matchCaseExpr.column = caseKeyword.column

    const captureComma = (tokens: TokenStream) => {
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

    let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
    const parsePattern = (tokens: TokenStream) => {

        const pattern = generatePattern(matchCaseExpr, tokens)
        lastDelim = null

        currentToken = tokens.currentToken
        
        return pattern
    }

    while (!tokens.isFinished) {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (isOperator(currentToken, ":")) {
            currentToken = skip(tokens, skipables)
            break
        }

        if (lastDelim?.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return lastDelim
        }

        const pattern = parsePattern(tokens)
        if (pattern.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return pattern
        }

        matchCaseExpr.patterns.push(pattern)

        lastDelim = captureComma(tokens)
        isInitial = false
    }

    const nodeGenerators = [generateBlock, generateInline] as any[]

    let node: Block
        | Inline
        | MismatchToken = null!

    for (const nodeGenerator of nodeGenerators) {
        node = nodeGenerator(matchCaseExpr, tokens)
        currentToken = tokens.currentToken

        if (node.type != "MismatchToken")
            break

        if (node.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return node
        }
    }

    currentToken = tokens.currentToken
    if (node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    matchCaseExpr.body = node
    matchCaseExpr.end = node.end

    return matchCaseExpr
}