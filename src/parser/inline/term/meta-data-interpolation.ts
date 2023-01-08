import { TokenStream } from "../../../lexer/token.js"
import { generateProgram } from "../../program.js"
import { createMismatchToken, isPunctuator, type Node } from "../../utility.js"

export function generateMetaDataInterpolation(context: Node, tokens: TokenStream): MetaDataInterpolation | MismatchToken {
    const metaDataInterpolation: MetaDataInterpolation = {
        type: "MetaDataInterpolation",
        body: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // $
    const initialCursor = tokens.cursor

    /* if(!isPunctuator(currentToken, "$")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }
    
    tokens.advance() // skip $
    currentToken = tokens.currentToken

    if (currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    const nodeGenerator = generateProgram(metaDataInterpolation, braceTokens)

    for(const node of nodeGenerator) {
        currentToken = braceTokens.currentToken
        if(node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }
        metaDataInterpolation.body.push(node)
    } */

    return metaDataInterpolation
}