import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, isPunctuator, skip, _skipables, type Node, skipables, isOperator, pickPrinter, NodePrinter, isBlockedType } from "../../utility.js"
import { generateAsExpression, printAsExpression } from "../expression/as-expression.js"
import { generateExpression, printExpression } from "../expression/expression.js"
import { generateKeyword } from "../keyword.js"

export function generateIfInline(context: string[], tokens: TokenStream): IfInline | MismatchToken {
    const ifInline: IfInline = {
        type: "IfInline",
        body: null!,
        condition: null!,
        fallback: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const ifKeyword = generateKeyword(["IfInline", ...context], tokens)

    if (ifKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return ifKeyword
    }

    if (!isKeyword(ifKeyword, "if")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    ifInline.start = ifKeyword.start
    ifInline.line = ifKeyword.line
    ifInline.column = ifKeyword.column

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const conditionGenerators = [generateAsExpression, generateExpression]

    let condition: AsExpression
        | Expression
        | MismatchToken = null!

    for (const conditionGenerator of conditionGenerators) {
        if (isBlockedType(conditionGenerator.name.replace("generate", '')))
            continue
        
        condition = conditionGenerator(["IfInline", ...context], tokens)
        currentToken = tokens.currentToken

        if (condition.type != "MismatchToken")
            break

        if (condition.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return condition
        }
    }

    if (condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    ifInline.condition = condition
    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const body = generateExpression(["IfInline", ...context], tokens)

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    ifInline.body = body

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const elseKeyword = generateKeyword(["IfInline", ...context], tokens)

    if (elseKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return elseKeyword
    }

    if (!isKeyword(elseKeyword, "else")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const fallback = generateExpression(["IfInline", ...context], tokens)

    if (fallback.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return fallback
    }

    ifInline.end = fallback.end
    ifInline.fallback = fallback

    return ifInline
}

export function printIfInline(token: IfInline, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [printAsExpression, printExpression] as NodePrinter[]
    const printer = pickPrinter(printers, token.condition)!

    const space = ' '.repeat(4)
    return "IfInline" +
        '\n' + space.repeat(indent) + middleJoiner + "condition\n" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        printer(token.condition, indent + 2) +
        '\n' + space.repeat(indent) + middleJoiner + "body\n" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        printExpression(token.body, indent + 2) +
        '\n' + space.repeat(indent) + endJoiner + "fallback\n" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        printExpression(token.fallback, indent + 2)
}