import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, DiagnosticMessage, PartialParse, isBlockedType, isPunctuator } from "../../utility.js"
import { generatePairType } from "./pair-type.js"
import { generateTypeExpression } from "./type-expression.js"

export function generateTupleType(context: string[], tokens: TokenStream): TupleType | MismatchToken {

    const tupleType: TupleType = {
        type: "TupleType",
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

    tupleType.line = currentToken.line
    tupleType.column = currentToken.column
    tupleType.start = currentToken.start

    currentToken = skip(tokens, skipables) // skip (

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

        const nodeGenerators = [generatePairType, generateTypeExpression]

        let value: PairType | TypeExpression | MismatchToken = null!
        for (const nodeGenerator of nodeGenerators) {

            if (isBlockedType(nodeGenerator.name.replace("generate", "")))
                continue

            value = nodeGenerator(["TupleLiteral", ...context], tokens)
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
            tupleType.end = currentToken.end
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

            if (isInitial && value.type == "PairType")
                argType = "keyword"

            while (value.type == "PairType") {

                const maybeTypeName = value.key
                let type = maybeTypeName.type

                if (maybeTypeName.type == "TypeName") {
                    break
                }

                const { line, column } = currentToken
                const error: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

                tokens.cursor = initialCursor
                return createMismatchToken(currentToken, [error, type, line, column])
            }

            while (argType == "keyword" && value.type == "TypeExpression") {
                const maybeTypeName = value.body
                let type: string = maybeTypeName.type

                if (maybeTypeName.type == "TypeName") {
                    break
                }

                const { line, column } = currentToken
                const error: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

                tokens.cursor = initialCursor
                return createMismatchToken(currentToken, [error, type, line, column])
            }

            tupleType[argType].push(value as any)
        }

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

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

    const hasValidArgs = tupleType.keyword.length >= 1
        || tupleType.positional.length > 1
        || tupleType.positional.length == 1 && lastDelim?.type != "MismatchToken"

    const hasSingleExpression = tupleType.positional.length == 1
        && lastDelim?.type != "MismatchToken"

    if (!hasValidArgs && hasSingleExpression) {
        let partialParse: PartialParse = {
            cursor: tokens.cursor,
            result: tupleType.positional.pop()!
        }
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    if (!hasValidArgs) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return tupleType
}