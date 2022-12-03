import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateProgram } from "../program.js"
import { isKeyword, skip, _skipables, type Node } from "../utility.js"

export function generateDoneBlock(context: Node, tokens: TokenStream): DoneBlock | MismatchToken {
    const doneBlock: DoneBlock = {
        type: "DoneBlock",
        body: [],
        status: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken // done
    currentToken = skip(tokens, _skipables)

    const status = generateIdentifier(doneBlock, tokens)
    if (status.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return status
    }

    doneBlock.status = status
    const nodeGenerator = generateProgram(doneBlock, tokens)

    for (let node of nodeGenerator) {

        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "end"))
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        doneBlock.body.push(node)
    }

    return doneBlock
}