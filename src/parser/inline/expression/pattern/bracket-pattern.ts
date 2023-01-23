import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, skipables, type Node } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateBracketPattern(context: Node, tokens: TokenStream): BracketPattern | MismatchToken {
    const bracketPattern: BracketPattern = {
        type: "BracketPattern",
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

    bracketPattern.start = currentToken.start
    bracketPattern.line = currentToken.line
    bracketPattern.column = currentToken.column

    const valueGenerators = [
        generateAsExpression, generateInfixPattern, generatePrefixPattern, generatePostfixPattern, generateTypeAssertion, generateBracePattern, generateParenPattern, generateBracketPattern,
        generateInterpPattern, generateLiteral
    ]

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

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

        let value: AsExpression
            | InfixPattern
            | PrefixPattern
            | PostfixPattern
            | TypeAssertion
            | BracePattern
            | ParenPattern
            | BracketPattern
            | InterpPattern
            | Literal
            | MismatchToken = null!
        
        for (let valueGenerator of valueGenerators) {
            value = valueGenerator(bracketPattern, tokens)
            currentToken = tokens.currentToken
            if (value.type != "MismatchToken")
                break

            if (value.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return value
            }
        }

        lastDelim = null
        return value
    }

    let isInitial = true
    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, "]")) {
            bracketPattern.end = currentToken.end
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

            bracketPattern.values.at(-1)?.push(value)
        }

        if (skipables.includes(currentToken))
            currentToken = skip(tokens, skipables)

        lastDelim = captureComma()

        if (lastDelim.type == "MismatchToken")
            lastDelim = captureSemicolon()

        if (lastDelim.type != "MismatchToken" && isPunctuator(lastDelim, ";"))
            bracketPattern.values.push([])

        isInitial = false
    }

    return bracketPattern
}