import { TokenStream } from "../../lexer/token.js"
import { generateExpression } from "../inline/expression/expression.js"
import { generateProgram } from "../program.js"
import { isKeyword, skip, skipables, type Node } from "../utility.js"
import { generateDoneBlock } from "./done-block.js"

export function generateForBlock(context: Node, tokens: TokenStream): ForBlock | MismatchToken {
    const forBlock: ForBlock = {
        type: "ForBlock",
        body: [],
        condition: null!,
        done: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables)
    const initialCursor = tokens.cursor
    const expression = generateExpression(forBlock, tokens)

    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    forBlock.condition = expression
    const nodeGenerator = generateProgram(forBlock, tokens)

    for (let node of nodeGenerator) {

        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "end"))
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        forBlock.body.push(node)
    }

    currentToken = tokens.currentToken
    if (isKeyword(currentToken, "done")) {

        const doneBlock = generateDoneBlock(forBlock, tokens)
        if (doneBlock.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return doneBlock
        }

        forBlock.done = doneBlock
    }

    return forBlock
}