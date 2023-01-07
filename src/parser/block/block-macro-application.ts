import { TokenStream } from "../../lexer/token.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generatePropertyAccess } from "../inline/term/property-access.js"
import { createMismatchToken, type Node } from "../utility.js"

export function generateBlockMacroApplication(context: Node, tokens: TokenStream): BlockMacroApplication | MismatchToken {
    const blockMacroApplication: BlockMacroApplication = {
        type: "BlockMacroApplication",
        caller: null!,
        left: [],
        right: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken // @@
    const nextToken = tokens.nextToken

    if (nextToken == null) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = nextToken

    if (currentToken.type != "Word") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    type CallerKind = Identifier | PropertyAccess | MismatchToken
    let caller: CallerKind = generatePropertyAccess(blockMacroApplication, tokens)

    if (caller.type == "MismatchToken")
        caller = generateIdentifier(blockMacroApplication, tokens)

    if (caller.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caller
    }

    blockMacroApplication.caller = caller

    return blockMacroApplication
}