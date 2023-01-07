import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, skipables, type Node } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateParenPattern(context: Node, tokens: TokenStream): ParenPattern | MismatchToken {
    const parenPattern: ParenPattern = {
        type: "ParenPattern",
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

    parenPattern.start = currentToken.start
    parenPattern.end = currentToken.end

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = parenTokens.currentToken

    const captureComma = () => {
        currentToken = skip(tokens, skipables)

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const nodeGenerators = [
        generateAsExpression, generateInfixPattern, generatePrefixPattern, generatePostfixPattern, generateTypeAssertion, generateBracePattern, generateParenPattern, generateBracketPattern,
        generateInterpPattern, generateLiteral
    ]

    const parsePattern = () => {
        let patternNode: AsExpression
            | TypeAssertion
            | BracePattern
            | BracketPattern
            | ParenPattern
            | PrefixPattern
            | InfixPattern
            | PostfixPattern
            | InterpPattern
            | Literal
            | MismatchToken = null!

        if (skipables.includes(currentToken.type) || isPunctuator(currentToken, ","))
            currentToken = skip(parenTokens, skipables)

        for (let nodeGenerator of nodeGenerators) {
            patternNode = nodeGenerator(parenPattern, tokens)
            currentToken = tokens.currentToken
            if (patternNode.type != "MismatchToken")
                break
        }

        currentToken = tokens.currentToken
        return patternNode
    }

    while (!parenTokens.isFinished) {

        if (parenTokens.currentToken.type == TokenType.EOF)
            break

        const patternNode = parsePattern()

        if (patternNode.type == "MismatchToken" && patternNode.value.type == TokenType.EOF)
            break

        if (patternNode.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return patternNode
        }

        parenPattern.values.push(patternNode)
        if (skipables.includes(currentToken.type))
            currentToken = skip(parenTokens, skipables)

        if (currentToken.type == TokenType.EOF)
            break

        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }

        currentToken = parenTokens.currentToken
    } */

    return parenPattern
}