import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility"

export function generateMetaDataInterpolation(context: Node, tokens: TokenStream): MetaDataInterpolation | MismatchToken {
    const metaDataInterpolation: MetaDataInterpolation = {
        type: "MetaDataInterpolation",
        body: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    
    tokens.advance() // skip $
    let currentToken = tokens.currentToken

    if (currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return metaDataInterpolation
}