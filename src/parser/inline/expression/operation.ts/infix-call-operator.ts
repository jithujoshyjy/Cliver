import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isBlockedType, isOperator, isPunctuator, skip, _skipables, type Node } from "../../../utility.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generatePropertyAccess } from "../../term/property-access.js"

export function generateInfixCallOperator(context: string[], tokens: TokenStream): InfixCallOperator | MismatchToken {
    const infixCallOperator: InfixCallOperator = {
        type: "InfixCallOperator",
        precedence: 9,
        caller: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // `
    const initialCursor = tokens.cursor

    if (!isOperator(currentToken, "`")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip `
    const nodeGenerators = [
        /* generatePropertyAccess, */ generateIdentifier
    ]

    let caller: Identifier
        | PropertyAccess
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        if (isBlockedType(nodeGenerator.name.replace("generate", '')))
            continue

        caller = nodeGenerator(["InfixCallOperator", ...context], tokens)
        currentToken = tokens.currentToken
        if (caller.type != "MismatchToken")
            break

        if (caller.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return caller
        }
    }

    if (caller.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caller
    }

    infixCallOperator.caller = caller
    currentToken = skip(tokens, _skipables) // `

    if (!isOperator(currentToken, "`")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return infixCallOperator
}

export function printInfixCallOperator(token: InfixCallOperator, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return "InfixCallOperator\n"
}