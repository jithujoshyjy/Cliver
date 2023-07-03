import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, isPunctuator } from "../../utility.js"
import { generateTypeAssertion } from "./type-assertion.js"

export function generateStructureType(context: string[], tokens: TokenStream): StructureType | MismatchToken {
    const structureType: StructureType = {
        type: "StructureType",
        fields: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    if (!isPunctuator(currentToken, "{")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    structureType.start = currentToken.start
    structureType.line = currentToken.line
    structureType.column = currentToken.column

    currentToken = skip(tokens, skipables) // skip {

    const captureComma = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(initialToken)
        }

        currentToken = skip(tokens, skipables)
        return initialToken
    }

    let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
    const parseTypeAssertion = (isInitial: boolean) => {

        let typeAssertion = generateTypeAssertion(["StructureType", ...context], tokens)
        currentToken = tokens.currentToken

        lastDelim = null
        return typeAssertion
    }

    while (!tokens.isFinished) {

        if (isPunctuator(currentToken, "}")) {
            structureType.end = currentToken.end
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

        const typeAssertion = parseTypeAssertion(isInitial)

        if (typeAssertion.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return typeAssertion
        }

        structureType.fields.push(typeAssertion)
        if (skipables.includes(currentToken))
            currentToken = skip(tokens, skipables)

        lastDelim = captureComma()
        isInitial = false
    }

    return structureType
}

export function printStructureType(token: StructureType, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = " ".repeat(4)


    return "StructureType"
}