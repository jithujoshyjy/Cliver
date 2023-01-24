import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateOperatorRef } from "../literal/operator-ref.js"
import { generateCallSiteArgsList } from "./call-site-args-list.js"
import { generatePropertyAccess } from "./property-access.js"

export function generateFunctionCall(context: Node, tokens: TokenStream): FunctionCall | MismatchToken {
    const functionCall: FunctionCall = {
        type: "FunctionCall",
        arguments: null!,
        caller: null!,
        externcallback: false,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    /* const nodeGenerators = [
        generatePropertyAccess, generateIdentifier,
        generateGroupExpression, generateOperatorRef
    ]

    let caller: Identifier
        | PropertyAccess
        | OperatorRef
        | GroupExpression
        | MismatchToken = null!

    for (const nodeGenerator of nodeGenerators) {
        caller = nodeGenerator(functionCall, tokens)
        currentToken = tokens.currentToken
        if (caller.type != "MismatchToken")
            break
    }

    if (caller.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caller
    }

    functionCall.caller = caller

    currentToken = skip(tokens, _skipables)
    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const args = generateCallSiteArgsList(functionCall, tokens)
    if (args.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return args
    }

    functionCall.arguments = args
    functionCall.externcallback = args.positional.some(x => x.type == "FunctionPrototype") */

    return functionCall
}

export function printFunctionCall(token: FunctionCall, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "FunctionCall\n"
}