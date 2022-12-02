import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility"
import { generateTypeAssertion } from "./type-assertion.js"

export function generateStructureType(context: Node, tokens: TokenStream): StructureType | MismatchToken {
    const structureType: StructureType = {
        type: "StructureType",
        fields: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    if(currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    const parseTypeMember = () => {
        currentToken = braceTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(braceTokens, skipables)

        let typeMember: TypeAssertion | MismatchToken = generateTypeAssertion(structureType, braceTokens)

        return typeMember
    }

    while (!braceTokens.isFinished) {
        const typeMember = parseTypeMember()

        if (typeMember.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return typeMember
        }

        structureType.fields.push(typeMember)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    return structureType
}