import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skipables, type Node, skip } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generatePairPattern } from "./pair-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateBracePattern(context: Node, tokens: TokenStream): BracePattern | MismatchToken {
    const bracePattern: BracePattern = {
        type: "BracePattern",
        values: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    /* if (currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    bracePattern.start = currentToken.start
    bracePattern.end = currentToken.end

    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = braceTokens.currentToken

    const captureComma = () => {
        currentToken = skip(tokens, skipables)

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const nodeGenerators = [
        generateTypeAssertion, generateAsExpression, generatePairPattern,
        generatePrefixPattern, generateLiteral,
    ]

    const parsePattern = () => {
        let patternNode: TypeAssertion
            | AsExpression
            | PairPattern
            | PrefixPattern
            | Literal
            | MismatchToken = null!
        
        if (skipables.includes(currentToken.type) || isPunctuator(currentToken, ","))
            currentToken = skip(braceTokens, skipables)

        for (let nodeGenerator of nodeGenerators) {
            patternNode = nodeGenerator(bracePattern, tokens)
            currentToken = tokens.currentToken
            if (patternNode.type != "MismatchToken")
                break
        }

        currentToken = tokens.currentToken
        return patternNode
    }

    while (!braceTokens.isFinished) {

        if (braceTokens.currentToken.type == TokenType.EOF)
            break

        const patternNode = parsePattern()

        if (patternNode.type == "MismatchToken" && patternNode.value.type == TokenType.EOF)
            break

        if (patternNode.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return patternNode
        }

        bracePattern.values.push(patternNode)
        if (skipables.includes(currentToken.type))
            currentToken = skip(braceTokens, skipables)

        if (currentToken.type == TokenType.EOF)
            break

        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }

        currentToken = braceTokens.currentToken
    } */

    return bracePattern
}