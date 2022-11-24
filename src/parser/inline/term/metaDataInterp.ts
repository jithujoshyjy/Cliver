import { TokenStream, TokenType } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateMetaDataInterpolation(context: Node, tokens: TokenStream): MetaDataInterpolation | MismatchToken {
    const metaDataInterpolation = {
        type: "MetaDataInterpolation",
        body: [],
        start: 0,
        end: 0
    }

    metaDataInterpolation.start = tokens.currentToken.i
    tokens.advance()
    let token = tokens.currentToken

    if (token.type != TokenType.BraceEnclosed) {
        let mismatchToken: MismatchToken = {
            type: "MismatchToken",
            error: `Unexpected token ${token.type} on ${token.line}:${token.column}`,
            value: token,
            start: 0,
            end: 0
        }
        return mismatchToken
    }

    return metaDataInterpolation as MetaDataInterpolation
}