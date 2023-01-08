import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, skipables, type Node } from "../../utility.js"
import { generateExpression, printExpression } from "../expression/expression.js"

export function generateArrayLiteral(context: Node, tokens: TokenStream): ArrayLiteral | MismatchToken {
    const arrayLiteral: ArrayLiteral = {
        type: "ArrayLiteral",
        values: [[]],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, "[")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    arrayLiteral.start = currentToken.start
    arrayLiteral.line = currentToken.line
    arrayLiteral.column = currentToken.column

    currentToken = skip(tokens, skipables)

    const captureComma = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ",")) {
            return createMismatchToken(initialToken)
        }

        currentToken = skip(tokens, skipables)
        return initialToken
    }

    const captureSemicolon = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ";")) {
            return createMismatchToken(initialToken)
        }

        currentToken = skip(tokens, skipables)
        return initialToken
    }

    let lastDelim: LexicalToken | MismatchToken | null = null
    const parseValue = () => {

        let value: Expression | MismatchToken = generateExpression(arrayLiteral, tokens)
        currentToken = tokens.currentToken

        lastDelim = null
        return value
    }

    let isInitial = true
    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, "]")) {
            tokens.advance()
            break
        }

        if (!isInitial && lastDelim == null) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        if (lastDelim?.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return lastDelim
        }

        if (!isPunctuator(currentToken, ";")) {
            const value = parseValue()

            if (value.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return value
            }

            arrayLiteral.values.at(-1)?.push(value)
        }

        if (skipables.includes(currentToken))
            currentToken = skip(tokens, skipables)

        lastDelim = captureComma()

        if (lastDelim.type == "MismatchToken")
            lastDelim = captureSemicolon()

        if (lastDelim.type != "MismatchToken" && isPunctuator(lastDelim, ";"))
            arrayLiteral.values.push([])

        isInitial = false
    }

    return arrayLiteral
}

export function printArrayLiteral(token: ArrayLiteral, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    return "ArrayLiteral\n" + '\t'.repeat(indent) + middleJoiner +
        token.values.reduce((a, c, i, arr) => a + (i + 1) + '\n' + '\t'.repeat(indent + 1) +
            (i == arr.length - 1 ? endJoiner : middleJoiner) +
            c.reduce((a, c, i, arr) =>
                a + (i == arr.length - 1 ? endJoiner : middleJoiner) +
                printExpression(c, indent + 2) + '\n', '') + '\n', "") +
        + '\n'

}