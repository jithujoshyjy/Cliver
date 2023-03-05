import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, skipables, type Node, DiagnosticDescriptionObj, DiagnosticMessage, PartialParse, isBlockedType } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generatePairPattern } from "./pair-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateParenPattern(context: string[], tokens: TokenStream): ParenPattern | MismatchToken {
    const parenPattern: ParenPattern = {
        type: "ParenPattern",
        positional: [],
        keyword: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, "(")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    parenPattern.line = currentToken.line
    parenPattern.column = currentToken.column
    parenPattern.start = currentToken.start

    currentToken = skip(tokens, skipables)
    const nodeGenerators = [
        generatePairPattern, generateAsExpression, generateInfixPattern, generatePrefixPattern,
        generatePostfixPattern, generateTypeAssertion, generateBracePattern,
        generateParenPattern, generateBracketPattern, generateInterpPattern, generateLiteral
    ]

    const captureComma = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ",")) {
            return createMismatchToken(initialToken)
        }

        currentToken = skip(tokens, skipables)
        return initialToken
    }

    let semicolonCount = 0
    const captureSemicolon = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ";")) {
            return createMismatchToken(initialToken)
        }

        semicolonCount++
        currentToken = skip(tokens, skipables)
        return initialToken
    }

    let lastDelim: LexicalToken | MismatchToken | null = null
    const parseValue = () => {

        let value: PairPattern
            | AsExpression
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

        for (const nodeGenerator of nodeGenerators) {

            if (isBlockedType(nodeGenerator.name.replace("generate", '')))
                continue

            value = nodeGenerator(["ParenPattern", ...context], tokens)
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

    let isInitial = true, argType: "positional" | "keyword" = "positional"
    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, ")")) {
            parenPattern.end = currentToken.end
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

            if (isInitial && value.type == "PairPattern")
                argType = "keyword"

            while (value.type == "PairPattern") {

                const maybeLiteral = value.key
                let type: string = maybeLiteral.type

                if (maybeLiteral.type == "Literal") {

                    const maybeIdentifier = maybeLiteral.value
                    if (maybeIdentifier.type == "Identifier")
                        break

                    type = maybeIdentifier.type
                }

                const { line, column } = currentToken
                const error: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

                tokens.cursor = initialCursor
                return createMismatchToken(currentToken, [error, type, line, column])
            }

            while (argType == "keyword" && value.type == "Literal") {
                const maybeIdentifier = value.value

                if (maybeIdentifier.type == "Identifier")
                    break

                const { line, column } = currentToken
                const error: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

                tokens.cursor = initialCursor
                return createMismatchToken(currentToken, [error, maybeIdentifier.type, line, column])
            }

            parenPattern[argType].push(value as any)
        }

        if (skipables.includes(currentToken))
            currentToken = skip(tokens, skipables)

        lastDelim = captureComma()

        if (lastDelim.type == "MismatchToken")
            lastDelim = captureSemicolon()

        if (lastDelim.type != "MismatchToken" && isPunctuator(lastDelim, ";")) {
            argType = "keyword"
            if (semicolonCount > 1) {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }
        }

        isInitial = false
    }

    const hasValidArgs = parenPattern.keyword.length >= 1 ||
        parenPattern.positional.length > 1 ||
        parenPattern.positional.length == 1 &&
        lastDelim?.type != "MismatchToken"

    if (!hasValidArgs) {
        tokens.cursor = initialCursor
        let partialParse: PartialParse | undefined

        if (parenPattern.positional.length == 1 && lastDelim?.type != "MismatchToken")
            partialParse = {
                cursor: tokens.cursor,
                result: parenPattern.positional.pop()!
            }

        const diagnostics: DiagnosticDescriptionObj = {
            message: "Unexpected token '{0}' on {1}:{2}",
            args: [currentToken.type, currentToken.line, currentToken.column],
            severity: 3,
        }

        return createMismatchToken(currentToken, { partialParse, diagnostics })
    }

    return parenPattern
}