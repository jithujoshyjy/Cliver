import { TokenStream } from "../../../lexer/token.js"
import { generateProgram } from "../../program.js"
import { isKeyword, skip, skipables, _skipables, type Node } from "../../utility.js"

export function generateElseBlock(context: Node, tokens: TokenStream): ElseBlock | MismatchToken {

    const elseBlock: ElseBlock = {
        type: "ElseBlock",
        body: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables)
    const initialCursor = tokens.cursor

    const nodeGenerator = generateProgram(elseBlock, tokens)

    for (let node of nodeGenerator) {

        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "end"))
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        elseBlock.body.push(node)
    }

    return elseBlock
}