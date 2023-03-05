import { TokenStream } from "../../../lexer/token.js"
import { generateBlock } from "../../block/block.js"
import { createMismatchToken, isKeyword, skip, type Node, _skipables, skipables, isPunctuator, isOperator, isBlockedType } from "../../utility.js"
import { printCaseExpr } from "../expression/case-expression.js"
import { generateExpression, printExpression } from "../expression/expression.js"
import { generatePattern } from "../expression/pattern/pattern.js"
import { generateInline } from "../inline.js"
import { generateKeyword } from "../keyword.js"

export function generateMatchInline(context: string[], tokens: TokenStream): MatchInline | MismatchToken {
    const matchInline: MatchInline = {
        type: "MatchInline",
        cases: [],
        matcher: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const matchKeyword = generateKeyword(["MatchInline", ...context], tokens)

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

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const expression = generateExpression(["MatchInline", ...context], tokens)
    currentToken = tokens.currentToken

    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    matchInline.matcher = expression
    let isInitial = true

    const parseCaseExpr = () => {
        const caseExpr: CaseExpr & { body: Expression | Block } = {
            type: "CaseExpr",
            pattern: null!,
            body: null!,
            line: 0,
            column: 0,
            start: 0,
            end: 0
        }

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const pattern = generatePattern(["MatchInline", ...context], tokens)
        if (pattern.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return pattern
        }

        caseExpr.pattern = pattern
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (!isOperator(currentToken, ":")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        currentToken = skip(tokens, skipables)
        const nodeGenerators = [generateBlock, generateExpression]

        let node: Block
            | Expression
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            if (isBlockedType(nodeGenerator.name.replace("generate", '')))
                continue
            node = nodeGenerator(["MatchInline", ...context], tokens)
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

        caseExpr.end = node.end
        caseExpr.body = node
        return caseExpr
    }

    while (!tokens.isFinished) {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const caseKeyword = generateKeyword(["MatchInline", ...context], tokens)
        const isCaseKw = isKeyword(caseKeyword, "case")

        if (isInitial && !isCaseKw) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, ["Unexpected token '{0}' on {1}:{2}", currentToken.type, currentToken.line, currentToken.column])
        }
        else if (!isCaseKw)
            break

        const caseExpr = parseCaseExpr()
        if (caseExpr.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return caseExpr
        }

        isInitial = false

        matchInline.start = caseExpr.start = caseKeyword.start
        matchInline.line = caseExpr.line = caseKeyword.line
        matchInline.column = caseExpr.column = caseKeyword.column
        matchInline.end = caseExpr.end

        matchInline.cases.push(caseExpr)
    }

    return matchInline
}

export function printMatchInline(token: MatchInline, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "MatchInline" +
        '\n' + space.repeat(indent) + middleJoiner + "matcher\n" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        printExpression(token.matcher, indent + 2) +
        '\n' + space.repeat(indent) + endJoiner + "cases\n" +
        token.cases.reduce((a, c, i, arr) => a +
            space.repeat(indent + 1) + (i == arr.length - 1 ? endJoiner : middleJoiner) +
            printCaseExpr(c, indent + 2) + '\n', '')
}