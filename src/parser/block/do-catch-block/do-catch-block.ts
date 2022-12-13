import { TokenStream } from "../../../lexer/token.js"
import { generateProgram, type ProgramGenerator } from "../../program.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node } from "../../utility.js"
import { generateDoneBlock } from "../done-block.js"
import { generateCatchBlock } from "./catch-block.js"

export function generateDoCatchBlock(context: Node, tokens: TokenStream): DoExpr | DoCatchBlock | MismatchToken {
    const doCatchBlock: DoCatchBlock = {
        type: "DoCatchBlock",
        body: [],
        handlers: [],
        done: null,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // do
    const initialCursor = tokens.cursor

    if(!isKeyword(currentToken, "do")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip do
    const nodes = generateProgram(doCatchBlock, tokens)

    for (let node of nodes) {
        currentToken = tokens.currentToken
        const isBlockStartKw = isKeyword(currentToken, "catch")
            || isKeyword(currentToken, "done")
            || isKeyword(currentToken, "end")

        if (node.type == "MismatchToken" && isBlockStartKw)
            break
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        doCatchBlock.body.push(node)
    }

    if (doCatchBlock.body.length === 0) {
        const error = `SyntaxError: Empty DoExpression on ${currentToken.line}:${currentToken.column}`
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken, error)
    }

    const captureCatch = () => {
        const catchHandler = generateCatchBlock(doCatchBlock, tokens)

        if (catchHandler.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return catchHandler
        }

        return catchHandler
    }

    while (!tokens.isFinished) {
        currentToken = tokens.currentToken
        if (isKeyword(currentToken, "catch")) {
            const catchHandler = captureCatch()

            if (catchHandler.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return catchHandler
            }

            doCatchBlock.handlers.push(catchHandler)
        }
        else if (isKeyword(currentToken, "done")) {
            if (doCatchBlock.done != null) {
                tokens.cursor = initialCursor
                const error = `SyntaxError: Unexpected done block on ${currentToken.line}:${currentToken.column}`
                return createMismatchToken(tokens.currentToken, error)
            }

            const doneBlock = generateDoneBlock(doCatchBlock, tokens)
            if (doneBlock.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return doneBlock
            }

            doCatchBlock.done = doneBlock
        }
        else if (isKeyword(currentToken, "end")) {
            doCatchBlock.end = currentToken.line
            break
        }
        else {
            tokens.cursor = initialCursor
            return createMismatchToken(tokens.currentToken)
        }
    }

    if (doCatchBlock.handlers.length === 0 && doCatchBlock.done === null) {
        const doExpr: DoExpr = {
            type: "DoExpr",
            body: doCatchBlock.body,
            start: doCatchBlock.start,
            end: doCatchBlock.end
        }
        return doExpr
    }

    return doCatchBlock
}