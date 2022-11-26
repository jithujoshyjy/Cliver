import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generatePropertyAccess } from "../inline/term/propertyAccess.js"
import { createMismatchToken, type Node } from "../utility"

export function generateBlockMacroApplication(context: Node, tokens: TokenStream): BlockMacroApplication | MismatchToken {
    const blockMacroApplication: BlockMacroApplication = {
        type: "BlockMacroApplication",
        caller: null!,
        left: [],
        right: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // @@
    const nextToken = tokens.nextToken

    if (nextToken == null)
        return createMismatchToken(currentToken)

    currentToken = nextToken

    if (currentToken.type != TokenType.Identifier)
        return createMismatchToken(currentToken)

    type CallerKind = Identifier | PropertyAccess | MismatchToken
    let caller: CallerKind = generatePropertyAccess(blockMacroApplication, tokens)

    if (caller.type == "MismatchToken")
        caller = generateIdentifier(blockMacroApplication, tokens)

    if (caller.type == "MismatchToken")
        return caller

    blockMacroApplication.caller = caller

    return blockMacroApplication
}