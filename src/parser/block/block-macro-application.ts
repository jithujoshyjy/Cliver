import { TokenStream } from "../../lexer/token.js"
import { generateNonVerbalOperator } from "../inline/expression/operation.ts/non-verbal-operator.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generatePropertyAccess } from "../inline/term/property-access.js"
import { createMismatchToken, isOperator, skip, type Node, _skipables } from "../utility.js"

export function generateBlockMacroApplication(context: Node, tokens: TokenStream): BlockMacroApplication | MismatchToken {
    const blockMacroApplication: BlockMacroApplication = {
        type: "BlockMacroApplication",
        caller: null!,
        left: [],
        right: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const maybeOperator = generateNonVerbalOperator(blockMacroApplication, tokens)
    if(maybeOperator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return maybeOperator
    }

    if (maybeOperator.name != "@@") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    blockMacroApplication.start = currentToken.start
    blockMacroApplication.line = currentToken.line
    blockMacroApplication.column = currentToken.column

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const nodeGenerators = [
        generatePropertyAccess, generateIdentifier
    ]

    let caller: Identifier
        | PropertyAccess
        | MismatchToken = null!

    for (const nodeGenerator of nodeGenerators) {
        caller = nodeGenerator(blockMacroApplication, tokens)
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

    blockMacroApplication.caller = caller
    return blockMacroApplication
}

export function printBlockMacroApplication(token: BlockMacroApplication, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "BlockMacroApplication\n"
}