import { TokenStream } from "../../../lexer/token.js"
import { generateProgram } from "../../program.js"
import { createMismatchToken, skip, skipables, type Node } from "../../utility.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateFunctionCall } from "./function-call.js"
import { generatePropertyAccess } from "./property-access.js"

export function generateObjectExtendNotation(context: Node, tokens: TokenStream): ObjectExtendNotation | MismatchToken {
    const objectExtendNotation: ObjectExtendNotation = {
        type: "ObjectExtendNotation",
        head: null!,
        body: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    /* let head: FunctionCall
        | PropertyAccess
        | Identifier
        | MismatchToken = generateFunctionCall(objectExtendNotation, tokens)

    if (head.type == "MismatchToken") {
        head = generatePropertyAccess(objectExtendNotation, tokens)
    }

    if (head.type == "MismatchToken") {
        head = generateIdentifier(objectExtendNotation, tokens)
    }

    if(head.type == "MismatchToken") {
        currentToken = tokens.currentToken
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)
    if(currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken) 
    }

    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    const nodeGenerator = generateProgram(objectExtendNotation, braceTokens)

    for(let node of nodeGenerator) {
        if(node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }
        objectExtendNotation.body.push(node)
    } */

    return objectExtendNotation
}