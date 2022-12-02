import { TokenStream } from "../../lexer/token.js"
import { generateAsExpression } from "../inline/expression/as-expression.js"
import { generateExpression } from "../inline/expression/expression.js"
import { generateProgram } from "../program.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node } from "../utility"
import { generateElseBlock } from "./elseBlock.js"

export function generateIfBlock(context: Node, tokens: TokenStream): IfBlock | MismatchToken {
    const ifBlock: IfBlock = {
        type: "IfBlock",
        alternate: null,
        body: [],
        condition: null!,
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables)
    const initialCursor = tokens.cursor
    let condition: AsExpression | Expression | MismatchToken = generateExpression(ifBlock, tokens)

    if (condition.type == "MismatchToken")
        condition = generateAsExpression(ifBlock, tokens)

    if (condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    ifBlock.condition = condition

    const nodeGenerator = generateProgram(ifBlock, tokens)

    for (let node of nodeGenerator) {

        currentToken = tokens.currentToken
        const isBlockStartKw = isKeyword(currentToken, "elseif")
            || isKeyword(currentToken, "else")
            || isKeyword(currentToken, "end")

        if (node.type == "MismatchToken" && isBlockStartKw)
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        ifBlock.body.push(node)
    }

    if (isKeyword(currentToken, "elseif")) {
        const alternate = generateIfBlock(ifBlock, tokens)
        if (alternate.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return alternate
        }
        ifBlock.alternate = alternate
    }
    else if (isKeyword(currentToken, "else")) {

        const alternate = generateElseBlock(ifBlock, tokens)
        if (alternate.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return alternate
        }

        ifBlock.alternate = alternate
    }
    else if (isKeyword(currentToken, "end"))
        ifBlock.end = currentToken.line
    else {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return ifBlock
}
