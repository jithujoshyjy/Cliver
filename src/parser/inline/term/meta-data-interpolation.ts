import { TokenStream } from "../../../lexer/token.js"
import { generateProgram } from "../../program.js"
import { createMismatchToken, isPunctuator, skip, type Node, skipables } from "../../utility.js"

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
return createMismatchToken(currentToken)
    /* if(!isPunctuator(currentToken, "$")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }
    
    tokens.advance() // skip $
    currentToken = tokens.currentToken

    if (!isPunctuator(currentToken, '{')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)
    const nodeGenerator = generateProgram(metaDataInterpolation, tokens)

    for(const node of nodeGenerator) {
        currentToken = tokens.currentToken
        if(node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }
        metaDataInterpolation.body.push(node)
    }

    return metaDataInterpolation */
}