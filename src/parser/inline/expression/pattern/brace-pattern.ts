import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skipables, type Node, skip } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generatePairPattern } from "./pair-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateBracePattern(context: Node, tokens: TokenStream): BracePattern | MismatchToken {
    const bracePattern: BracePattern = {
        type: "BracePattern",
        values: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, '{')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)
    bracePattern.start = currentToken.start
    bracePattern.end = currentToken.end

    bracePattern.line = currentToken.line
    bracePattern.column = currentToken.column

    const captureComma = () => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (!isPunctuator(currentToken, ","))
            return createMismatchToken(currentToken)

        currentToken = skip(tokens, skipables)
        return currentToken
    }

    const nodeGenerators = [
        generateTypeAssertion, generateAsExpression, generatePairPattern,
        generatePrefixPattern, generateLiteral,
    ]

    let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
    const parsePattern = () => {
        let patternNode: TypeAssertion
            | AsExpression
            | PairPattern
            | PrefixPattern
            | Literal
            | MismatchToken = null!

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        for (let nodeGenerator of nodeGenerators) {
            patternNode = nodeGenerator(bracePattern, tokens)
            currentToken = tokens.currentToken

            if (patternNode.type != "MismatchToken")
                break

            if (patternNode.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return patternNode
            }
        }

        lastDelim = null
        currentToken = tokens.currentToken
        
        return patternNode
    }

    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, "}")) {
            bracePattern.end = currentToken.end
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

        const patternNode = parsePattern()

        if (patternNode.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return patternNode
        }

        bracePattern.values.push(patternNode)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }

        lastDelim = captureComma()
        isInitial = false

        currentToken = tokens.currentToken
    }

    return bracePattern
}