import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, skip, _skipables, type Node } from "../../../utility.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generatePropertyAccess } from "../../term/property-access.js"

export function generateInfixCallOperator(context: Node, tokens: TokenStream): InfixCallOperator | MismatchToken {
    const infixCallOperator: InfixCallOperator = {
        type: "InfixCallOperator",
        precedence: 9,
        caller: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // `
    const initialCursor = tokens.cursor

    if(!isPunctuator(currentToken, "`")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables) // skip `
    let caller: Identifier
        | PropertyAccess
        | MismatchToken = generatePropertyAccess(infixCallOperator, tokens)

    if(caller.type == "MismatchToken") {
        caller = generateIdentifier(infixCallOperator, tokens)
    }

    if(caller.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caller
    }

    infixCallOperator.caller = caller
    currentToken = skip(tokens, _skipables) // `

    if(!isPunctuator(currentToken, "`")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    tokens.advance()
    return infixCallOperator
}