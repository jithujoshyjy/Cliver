import { TokenStream } from "../../../lexer/token.js"
import { generatePattern } from "../../inline/expression/pattern/pattern.js"
import { generateProgram } from "../../program.js"
import { createMismatchToken, isKeyword, isPunctuator, skip, skipables, _skipables, type Node } from "../../utility.js"

export function generateCatchBlock(context: Node, tokens: TokenStream): CatchBlock | MismatchToken {
    const catchBlock: CatchBlock = {
        type: "CatchBlock",
        body: [],
        params: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // catch

    const capturePattern = () => {
        currentToken = skip(tokens, skipables)
        const pattern = generatePattern(catchBlock, tokens)

        return pattern
    }

    const captureComma = () => {
        currentToken = skip(tokens, _skipables)

        if (!isPunctuator(currentToken, ","))
            return createMismatchToken(currentToken)

        return currentToken
    }

    const firstPattern = capturePattern()
    if (firstPattern.type == "MismatchToken")
        return firstPattern

    catchBlock.params.push(firstPattern)

    while (!tokens.isFinished) {
        const comma = captureComma()
        if (comma.type == "MismatchToken")
            break
        const pattern = capturePattern()
        if (pattern.type == "MismatchToken")
            return pattern

        catchBlock.params.push(pattern)
    }

    const nodeGenerator = generateProgram(catchBlock, tokens)

    for (let node of nodeGenerator) {

        currentToken = tokens.currentToken
        const isBlockStartKw = isKeyword(currentToken, "catch")
            || isKeyword(currentToken, "done")
            || isKeyword(currentToken, "end")

        if (node.type == "MismatchToken" && isBlockStartKw)
            break
        else if (node.type == "MismatchToken")
            return node

        catchBlock.body.push(node)
    }

    return catchBlock
}